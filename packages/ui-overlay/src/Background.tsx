// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useAnimate } from 'motion/react'
import { useEffect } from 'react'
import type { CanvasStatus } from 'types'
import { Backdrop } from 'ui-core/overlay'
import { useOverlay } from './Provider'

export const Background = ({
	externalOverlayStatus,
}: {
	externalOverlayStatus?: CanvasStatus
}) => {
	const [scope, animate] = useAnimate()
	const {
		modal: { status: modalStatus },
		canvas: { status: canvasStatus },
	} = useOverlay()

	let { openOverlayInstances } = useOverlay()
	if (externalOverlayStatus === 'open') {
		openOverlayInstances++
	}

	const onIn = async () => {
		if (!scope.current) {
			return
		}
		await animate(scope.current, { opacity: 1 }, { duration: 0.15 })
	}

	const onOut = async () => {
		if (!scope.current) {
			return
		}
		await animate(scope.current, { opacity: 0 }, { duration: 0.15 })
	}

	useEffect(() => {
		if (openOverlayInstances > 0) {
			onIn()
		}
		if (openOverlayInstances === 0) {
			onOut()
		}
	}, [openOverlayInstances])

	return modalStatus === 'closed' &&
		canvasStatus === 'closed' &&
		externalOverlayStatus === 'closed' ? null : (
		<Backdrop
			ref={scope}
			blur={
				externalOverlayStatus === 'open' || canvasStatus === 'open'
					? '1.4rem'
					: '0rem'
			}
			initial={{
				opacity: 0,
			}}
		/>
	)
}
