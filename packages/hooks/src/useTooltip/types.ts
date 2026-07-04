// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface TooltipHookInterface {
	openTooltip: () => void
	closeTooltip: () => void
	setTooltipPosition: (x: number, y: number) => void
	showTooltip: () => void
	setTooltipTextAndOpen: (t: string) => void
	open: number
	show: number
	position: [number, number]
	text: string
}

export interface TooltipHookState {
	open: number
	show: number
	position: [number, number]
	text: string
}
