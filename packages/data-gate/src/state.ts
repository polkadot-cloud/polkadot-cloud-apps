// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	activeEra$,
	apiStatus$,
	getActiveEra,
	getApiStatus,
	getNetwork,
	getServiceInterface,
	plugins$,
	serviceInterface$,
} from 'global-bus'
import { merge } from 'rxjs'
import { createObservableStore } from 'utils'
import type { DataGateState } from './types'

// Shared context lets data points configure node and staking API queries and decide when each
// source has the inputs it needs to run. The node interface, connection readiness and active era
// supply query inputs and prerequisites; React Query tracks each query's loading and error state.
//
// Each provider shares one bus subscription; plugin events include network changes.
export const createDataGateStore = () =>
	createObservableStore<DataGateState>(
		merge(activeEra$, apiStatus$, serviceInterface$, plugins$),
		() => ({
			node: getServiceInterface(),
			ready: getApiStatus(getNetwork()) === 'ready',
			era: getActiveEra().index,
		}),
	)
