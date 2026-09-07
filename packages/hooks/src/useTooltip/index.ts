// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSingletonStore, useSingletonStore } from '../util'
import type {
	TooltipActions,
	TooltipHookInterface,
	TooltipHookState,
} from './types'

export type {
	TooltipActions,
	TooltipHookInterface,
	TooltipHookState,
} from './types'

const defaultTooltipState: TooltipHookState = {
	open: 0,
	show: 0,
	position: [0, 0],
	text: '',
}

const tooltipStore = createSingletonStore<TooltipHookState>(defaultTooltipState)

const tooltipActions: TooltipActions = {
	openTooltip: () => {
		if (tooltipStore.getSnapshot().open) {
			return
		}
		tooltipStore.patchSnapshot({
			open: 1,
		})
	},

	closeTooltip: () => {
		tooltipStore.patchSnapshot({
			open: 0,
			show: 0,
		})
	},

	setTooltipPosition: (x, y) => {
		tooltipStore.patchSnapshot((current) => ({
			open: current.open || 1,
			position: [x, y],
		}))
	},

	showTooltip: () => {
		tooltipStore.patchSnapshot({
			show: 1,
		})
	},

	setTooltipTextAndOpen: (text) => {
		if (tooltipStore.getSnapshot().open) {
			return
		}
		tooltipStore.patchSnapshot({
			open: 1,
			text,
		})
	},
}

// Tooltip triggers only need actions, so they must not subscribe to pointer updates.
export const useTooltipActions = (): TooltipActions => tooltipActions

export const useTooltip = (): TooltipHookInterface => {
	const state = useSingletonStore(tooltipStore)

	return {
		...tooltipActions,
		...state,
	}
}
