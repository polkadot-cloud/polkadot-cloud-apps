// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useAnimate } from 'motion/react'
import type { ComponentType } from 'react'
import { Suspense, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Container, Content, Scroll } from 'ui-core/canvas'
import { OverlayPreload } from './Preload'
import { useOverlay } from './Provider'
import type { CanvasProps } from './Provider/types'

export const Canvas = ({
	canvas,
	externalOverlayStatus,
	fallback: Fallback,
}: CanvasProps) => {
	const [scope, animate] = useAnimate()
	const {
		setOpenOverlayInstances,
		activeOverlayInstance,
		setActiveOverlayInstance,
		modal: { status: modalStatus },
		canvas: {
			status,
			setCanvasStatus,
			config: { key, size },
		},
	} = useOverlay()

	const onIn = async () => {
		await animate(scope.current, { opacity: 1 }, { duration: 0.15 })
	}

	const onOut = async (closing: boolean) => {
		if (closing) {
			setOpenOverlayInstances('dec', 'canvas')
			setActiveOverlayInstance(modalStatus === 'open' ? 'modal' : null)
		}
		await animate(scope.current, { opacity: 0 }, { duration: 0.15 })

		if (closing) {
			setCanvasStatus('closed')
		}
	}

	// Control dim help status change
	useEffect(() => {
		if (externalOverlayStatus === 'open' && status === 'open') {
			onOut(false)
		}

		if (externalOverlayStatus === 'closing') {
			if (activeOverlayInstance === 'canvas') {
				setCanvasStatus('open')
				onIn()
			}
		}
	}, [externalOverlayStatus])

	// Control fade in and out on opening and closing states
	useEffect(() => {
		if (status === 'open') {
			onIn()
		}
		if (status === 'closing') {
			onOut(true)
		}
	}, [status])

	const ActiveCanvas: ComponentType | null = canvas?.[key] || null

	return status === 'closed' ? null : (
		<Container
			ref={scope}
			initial={{
				opacity: 0,
			}}
		>
			<Scroll>
				<Content size={size}>
					<ErrorBoundary FallbackComponent={Fallback}>
						<Suspense fallback={<OverlayPreload type="canvas" />}>
							{ActiveCanvas && <ActiveCanvas />}
						</Suspense>
					</ErrorBoundary>
				</Content>
			</Scroll>
		</Container>
	)
}
