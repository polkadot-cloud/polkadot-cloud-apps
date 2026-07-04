// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

type MaybeString = string | null

export interface HelpHookInterface {
	openHelpTooltip: (
		definition: MaybeString,
		anchor: HTMLButtonElement | null,
	) => void
	closeHelpTooltip: () => void
	isTooltipOpen: boolean
	tooltipDefinition: MaybeString
	tooltipAnchor: HTMLElement | null
}

export interface HelpHookState {
	isTooltipOpen: boolean
	tooltipDefinition: MaybeString
	tooltipAnchor: HTMLElement | null
}
