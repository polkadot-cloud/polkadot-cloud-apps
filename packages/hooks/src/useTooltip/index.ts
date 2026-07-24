// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback } from 'react'
import { createSingletonStore, useSingletonStore } from '../util'
import type { TooltipHookInterface, TooltipHookState } from './types'

export type { TooltipHookInterface, TooltipHookState } from './types'

const defaultTooltipState: TooltipHookState = {
	open: 0,
	show: 0,
	position: [0, 0],
	text: '',
}

const tooltipStore = createSingletonStore<TooltipHookState>(defaultTooltipState)

export const useTooltip = (): TooltipHookInterface => {
	const state = useSingletonStore(tooltipStore)

	const openTooltip = useCallback(() => {
		if (tooltipStore.getSnapshot().open) {
			return
		}
		tooltipStore.patchSnapshot({
			open: 1,
		})
	}, [])

	const closeTooltip = useCallback(() => {
		tooltipStore.patchSnapshot({
			open: 0,
			show: 0,
		})
	}, [])

	const setTooltipPosition = useCallback((x: number, y: number) => {
		tooltipStore.patchSnapshot((current) => ({
			open: current.open || 1,
			position: [x, y],
		}))
	}, [])

	const showTooltip = useCallback(() => {
		tooltipStore.patchSnapshot({
			show: 1,
		})
	}, [])

	const setTooltipTextAndOpen = useCallback((text: string) => {
		if (tooltipStore.getSnapshot().open) {
			return
		}
		tooltipStore.patchSnapshot({
			open: 1,
			text,
		})
	}, [])

	return {
		openTooltip,
		closeTooltip,
		setTooltipPosition,
		showTooltip,
		setTooltipTextAndOpen,
		open: state.open,
		show: state.show,
		position: state.position,
		text: state.text,
	}
}
