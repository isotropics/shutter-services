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

"""This module contains the shared state for the abci skill of GnosisChainAbciApp."""

from packages.valory.skills.abstract_round_abci.models import BaseParams
from packages.valory.skills.abstract_round_abci.models import (
    BenchmarkTool as BaseBenchmarkTool,
)
from packages.valory.skills.abstract_round_abci.models import Requests as BaseRequests
from packages.valory.skills.abstract_round_abci.models import (
    SharedState as BaseSharedState,
)
from packages.isotrop.skills.shutter_analytics_agent.rounds import ShutterAnalyticsAbciApp
from typing import Any

class SharedState(BaseSharedState):
    """Keep the current shared state of the skill."""

    abci_app_cls = ShutterAnalyticsAbciApp

class IsotropParams(BaseParams):
    """Isotrop agent skill parameters."""

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        """Initialize the parameters."""
        self.log_path:str = self._ensure("log_path", kwargs, str)
        self.base_url:str = self._ensure("base_url", kwargs, str)
        self.api_key:str  = self._ensure("api_key", kwargs, str)
        self.wait_time:int= self._ensure("wait_time", kwargs, int)
        super().__init__(*args, **kwargs)


#Params = BaseParams
Requests = BaseRequests
BenchmarkTool = BaseBenchmarkTool
