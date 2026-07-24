// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Background } from './Background'
import { Canvas } from './Canvas'
import { Modal } from './Modal'
import type { OverlayProps } from './Provider/types'

export const Overlay = ({
	modals = {},
	canvas = {},
	fallback,
	externalOverlayStatus,
}: OverlayProps) => (
	<>
		<Background externalOverlayStatus={externalOverlayStatus} />
		<Modal
			fallback={fallback}
			modals={modals}
			externalOverlayStatus={externalOverlayStatus}
		/>
		<Canvas
			fallback={fallback}
			canvas={canvas}
			externalOverlayStatus={externalOverlayStatus}
		/>
	</>
)
