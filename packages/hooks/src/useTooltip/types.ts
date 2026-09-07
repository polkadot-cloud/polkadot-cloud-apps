// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface TooltipActions {
	openTooltip: () => void
	closeTooltip: () => void
	setTooltipPosition: (x: number, y: number) => void
	showTooltip: () => void
	setTooltipTextAndOpen: (t: string) => void
}

export interface TooltipHookInterface
	extends TooltipActions,
		TooltipHookState {}

export interface TooltipHookState {
	open: number
	show: number
	position: [number, number]
	text: string
}
