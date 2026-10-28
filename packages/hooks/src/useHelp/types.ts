// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface HelpHookInterface {
	openHelpTooltip: (
		definition: string | null,
		anchor: HTMLButtonElement | null,
	) => void
	closeHelpTooltip: () => void
	isTooltipOpen: boolean
	tooltipDefinition: string | null
	tooltipAnchor: HTMLElement | null
}

export interface HelpHookState {
	isTooltipOpen: boolean
	tooltipDefinition: string | null
	tooltipAnchor: HTMLElement | null
}
