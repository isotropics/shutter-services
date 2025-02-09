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

"""This package contains the rounds of ShutterAnalyticsAbciApp."""

from enum import Enum
from typing import Dict, FrozenSet, List, Optional, Set, Tuple

from packages.valory.skills.abstract_round_abci.base import (
    AbciApp,
    AbciAppTransitionFunction,
    AbstractRound,
    AppState,
    BaseSynchronizedData,
    CollectSameUntilAllRound,
    CollectDifferentUntilThresholdRound,
    OnlyKeeperSendsRound,
    DegenerateRound,
    EventToTimeout,
)

from packages.isotrop.skills.shutter_analytics_agent.payloads import (
    CollectionPayload,
    ErrorPayload,
    WaitPayload,
)


class Event(Enum):
    """ShutterAnalyticsAbciApp Events"""

    WAIT_TIMEOUT = "wait_timeout"
    ROUND_TIMEOUT = "round_timeout"
    ERROR = "error"
    DONE = "done"


class SynchronizedData(BaseSynchronizedData):
    """
    Class to represent the synchronized data.

    This data is replicated by the tendermint application.
    """
    @property
    def participants(self) -> frozenset:
        participants = self.db.get_strict("all_participants")
        if not participants:
            raise ValueError("List participants cannot be empty.")
        return frozenset(participants)


class CollectionRound(CollectDifferentUntilThresholdRound):
    """ConnectRound - Collects different payloads until a threshold is reached."""

    payload_class = CollectionPayload
    synchronized_data_class = SynchronizedData
    
    def end_block(self) -> Optional[Tuple[BaseSynchronizedData, Enum]]:
        return self.synchronized_data, Event.DONE

class ErrorRound(OnlyKeeperSendsRound):
    """ErrorRound - Only one participant (the keeper) sends a payload."""

    payload_class = ErrorPayload
    synchronized_data_class = SynchronizedData

    def end_block(self) -> Optional[Tuple[BaseSynchronizedData, Enum]]:
        return self.synchronized_data, Event.ERROR


class WaitRound(CollectDifferentUntilThresholdRound):
    """WaitRound - Only one participant (the keeper) sends a payload."""

    payload_class = WaitPayload
    synchronized_data_class = SynchronizedData

    def end_block(self) -> Optional[Tuple[BaseSynchronizedData, Enum]]:
        return self.synchronized_data, Event.WAIT_TIMEOUT


class ShutterAnalyticsAbciApp(AbciApp[Event]):
    """ShutterAnalyticsAbciApp"""

    initial_round_cls: AppState = CollectionRound
    initial_states: Set[AppState] = {CollectionRound}
    transition_function: AbciAppTransitionFunction = {
        CollectionRound: {
            Event.DONE: WaitRound,
            Event.ERROR: ErrorRound
        },
        WaitRound: {
            Event.WAIT_TIMEOUT: CollectionRound
        },
        ErrorRound: {
            Event.ROUND_TIMEOUT: CollectionRound,
            Event.WAIT_TIMEOUT: CollectionRound
        }
    }
    final_states: Set[AppState] = set()
    event_to_timeout: EventToTimeout = {}
    cross_period_persisted_keys: FrozenSet[str] = frozenset()
    db_pre_conditions: Dict[AppState, Set[str]] = {
        CollectionRound: [],
    }
    db_post_conditions: Dict[AppState, Set[str]] = {

    }