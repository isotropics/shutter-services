# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2024 Valory AG
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
# ------------------------------------------------------------------------------

"""This package contains round behaviours of GnosisChainAbciApp."""

from abc import ABC
import json
import time
from typing import Generator, Set, Type, cast
import os
import requests
from typing import Generator, Dict
from datetime import datetime, timedelta


from packages.valory.skills.abstract_round_abci.base import AbstractRound
from packages.valory.skills.abstract_round_abci.behaviours import (
    AbstractRoundBehaviour,
    BaseBehaviour,
)

from packages.isotrop.skills.shutter_analytics_agent.models import IsotropParams
from packages.isotrop.skills.shutter_analytics_agent.rounds import (
    SynchronizedData,
    ShutterAnalyticsAbciApp,
    CollectionRound,
    ErrorRound,
    WaitRound,
)
from packages.isotrop.skills.shutter_analytics_agent.rounds import (
    CollectionPayload,
    ErrorPayload,
    WaitPayload,
)

from packages.valory.protocols.ledger_api.message import LedgerApiMessage

class ShutterAnalyticsBaseBehaviour(BaseBehaviour, ABC):
    """Base behaviour for the shutter_anyalytics_agent skill."""

    @property
    def synchronized_data(self) -> SynchronizedData:
        """Return the synchronized data."""
        return cast(SynchronizedData, super().synchronized_data)

    @property
    def params(self) -> IsotropParams:
        """Return the params."""
        return cast(IsotropParams, self.context.params)

class CollectionBehaviour(ShutterAnalyticsBaseBehaviour):
    """CollectionBehaviour"""

    matching_round: Type[AbstractRound] = CollectionRound

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._state = "Collection"
        self.context.logger.info("Entering into collection state")
        self.context.logger.info(self.params.log_path)
        self.context.logger.info(self.params.base_url)
        self.context.logger.info(self.params.api_key)
        
    def get_log_filename(self) -> str:
        """Generate the log filename for one hour back."""
        logs_dir = self.params.log_path

        if not logs_dir:
            self.context.logger.error("LOG_PATH not set in the environment.")
            return None  # Return None if not set

        now = datetime.now()
        current_hour = now.replace(minute=0, second=0, microsecond=0)
        one_hour_back = current_hour - timedelta(hours=1)
        log_filename = f"transactions_{one_hour_back.strftime('%Y-%m-%d_%H')}.log"
        #check last hour log path
        log_path = os.path.join(logs_dir, log_filename)
        self.context.logger.info(f"Log path: {log_path}")
        return log_path
    
    def parse_log_entry(self, log_entry: str) -> Dict:
        """Parse a log entry and convert it into a structured dictionary for PostgreSQL."""
        try:
            # Example log format:
            # date=2025-02-05,time=12:14:56,trans_id=0x675216463816,mev_type=front_run,trade_amnt=100.0,swap_amnt=102.0,profit=2.000000,loss=0.000000
            log_parts = {kv.split('=')[0]: kv.split('=')[1] for kv in log_entry.split(',')}

            return {
                "date": log_parts["date"],  # YYYY-MM-DD format
                "time": log_parts["time"],  # HH:MM:SS format
                "trans_id": log_parts["trans_id"],
                "mev_type": log_parts["mev_type"],
                "trade_amnt": float(log_parts["trade_amnt"]),
                "expected_amnt": float(log_parts["expected_amnt"]),
                "profit_percentage": float(log_parts["profit_percentage"]),
                "original_loss_percentage": float(log_parts["original_loss_percentage"])
            }
        except Exception as e:
            self.context.logger.error(f"Failed to parse log entry: {log_entry}. Error: {e}")
            return None  # Return None if parsing fails
        
    def send_log_to_api(self, log_data: Dict):
        """Send a structured log entry to the API, which inserts into PostgreSQL."""
        api_key = self.params.api_key
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        api_url = self.params.base_url + "/logs"
        
        try:
            response = requests.post(api_url, json=log_data, headers=headers)
            if response.status_code == 201:
                self.context.logger.info(f"Successfully sent log: {log_data}")
            else:
                self.context.logger.error(f"Failed to send log: {log_data}, Status Code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            self.context.logger.error(f"Error sending log to API: {e}")     

    def collect_logs(self) -> Generator[Dict, None, None]:
        """Collect logs from the dynamically determined log file and send them to the API."""
        log_path = self.get_log_filename()

        if not log_path:
            return  # Stop execution if no valid log file path

        try:
            with open(log_path, 'r') as log_file:
                for line in log_file:
                    log_entry = line.strip()
                    self.context.logger.info(f"Raw Log: {log_entry}")

                    # Parse log entry
                    parsed_log = self.parse_log_entry(log_entry)
                    if parsed_log:
                        # Send log entry to API
                        self.send_log_to_api(parsed_log)

                        yield parsed_log  # Yield each parsed log entry
                
        except FileNotFoundError:
            self.context.logger.error(f"Log file not found: {log_path}")
        except Exception as e:
            self.context.logger.error(f"Error reading log file: {e}")

    def async_act(self) -> Generator:
        """Do the act, supporting asynchronous execution."""
        with self.context.benchmark_tool.measure(self.behaviour_id).local():
            # Print collecting logs
            self.context.logger.info("Collecting logs")

            # Yield logs collected from the file
            yield from self.collect_logs()  # Yield each log line from collect_logs()

        self.set_done()  # Mark the task as done after completing    
    
class ErrorBehaviour(ShutterAnalyticsBaseBehaviour):
    """ErrorBehaviour"""

    matching_round: Type[AbstractRound] = ErrorRound

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._state = "Error"
        self.context.logger.info("entering into error state")

    def async_act(self) -> Generator:
        """Handle errors asynchronously."""

        with self.context.benchmark_tool.measure(self.behaviour_id).local():
            sender = self.context.agent_address
            error_message = "An error occurred in the FSM."
            self.context.logger.error(error_message)
            payload = ErrorPayload(sender=sender, error_content=error_message)

        with self.context.benchmark_tool.measure(self.behaviour_id).consensus():
            yield from self.send_a2a_transaction(payload)
            yield from self.wait_until_round_end()

        self.set_done()


class WaitBehaviour(ShutterAnalyticsBaseBehaviour):
    """WaitBehaviour"""

    matching_round: Type[AbstractRound] = WaitRound

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._state = "Wait"
        self.context.logger.info("entering into wait state")

    def async_act(self) -> Generator:
        """Wait asynchronously for a given condition."""

        with self.context.benchmark_tool.measure(self.behaviour_id).local():
            sender = self.context.agent_address
            waitTime = self.params.wait_time
            payload = WaitPayload(sender=sender)
            self.context.logger.info("sleeping for "+str(waitTime)+ " sec before fetching another set of logs")
            #wait for sec gave in env variable to fetch the logs again
            time.sleep(waitTime)
        with self.context.benchmark_tool.measure(self.behaviour_id).consensus():
            yield from self.send_a2a_transaction(payload)
            yield from self.wait_until_round_end()

        self.set_done()


class ShutterAnalyticsRoundBehaviour(AbstractRoundBehaviour):
    """ShutterAnalyticsRoundBehaviour"""

    initial_behaviour_cls = CollectionBehaviour
    abci_app_cls = ShutterAnalyticsAbciApp  # type: ignore
    behaviours: Set[Type[BaseBehaviour]] = [
        CollectionBehaviour,
        ErrorBehaviour,
        WaitBehaviour
    ]



