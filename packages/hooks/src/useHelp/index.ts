// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback } from 'react'
import { createSingletonStore, useSingletonStore } from '../util'
import type { HelpHookInterface, HelpHookState } from './types'

export type { HelpHookInterface, HelpHookState } from './types'

const defaultHelpState: HelpHookState = {
	isTooltipOpen: false,
	tooltipDefinition: null,
	tooltipAnchor: null,
}

const helpStore = createSingletonStore<HelpHookState>(defaultHelpState)

export const useHelp = (): HelpHookInterface => {
	const state = useSingletonStore(helpStore)

	const openHelpTooltip = useCallback(
		(definition: string | null, anchor: HTMLButtonElement | null) => {
			helpStore.setSnapshot({
				isTooltipOpen: true,
				tooltipDefinition: definition,
				tooltipAnchor: anchor,
			})
		},
		[],
	)

	const closeHelpTooltip = useCallback(() => {
		helpStore.resetSnapshot()
	}, [])

	return {
		openHelpTooltip,
		closeHelpTooltip,
		isTooltipOpen: state.isTooltipOpen,
		tooltipDefinition: state.tooltipDefinition,
		tooltipAnchor: state.tooltipAnchor,
	}
}
