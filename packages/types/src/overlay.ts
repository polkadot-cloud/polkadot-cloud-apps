// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type OverlayInstanceDirection = 'inc' | 'dec'

export type ActiveOverlayInstance = 'modal' | 'canvas' | null

export type OverlayType = 'modal' | 'canvas'

export type CanvasStatus = 'open' | 'closing' | 'closed'

export type ModalStatus =
	| 'opening'
	| 'open'
	| 'closing'
	| 'closed'
	| 'replacing'

export type ModalSize = 'xs' | 'sm' | 'lg' | 'xl'

export type CanvasSize = 'lg' | 'xl'

export type DisplayFor = 'default' | 'modal' | 'canvas' | 'card'
