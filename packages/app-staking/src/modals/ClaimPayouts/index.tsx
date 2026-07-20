// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils'
import { usePayouts } from 'hooks/usePayouts'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalTitle } from 'ui-app/ModalTitle'
import { FixedTitle, Multi, MultiTwo, Section } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { Forms } from './Forms'
import { Overview } from './Overview'
import type { ActivePayout } from './types'

export const ClaimPayouts = () => {
	const { t } = useTranslation('modals')
	const { unclaimedRewards } = usePayouts()
	const { setModalHeight, modalMaxHeight } = useOverlay().modal

	// Active modal section.
	const [section, setSectionState] = useState<number>(0)
	const sectionRef = useRef(section)

	const setSection = (s: number) => {
		setStateWithRef(s, setSectionState, sectionRef)
	}

	// Unclaimed payout(s) that will be applied to submission form.
	const [payouts, setPayouts] = useState<ActivePayout[] | null>(null)

	const headerRef = useRef<HTMLDivElement>(null)
	const overviewRef = useRef<HTMLDivElement>(null)
	const formsRef = useRef<HTMLDivElement>(null)

	const getModalHeight = () => {
		let h = headerRef.current?.clientHeight ?? 0
		if (sectionRef.current === 0) {
			h += overviewRef.current?.clientHeight ?? 0
		} else {
			h += formsRef.current?.clientHeight ?? 0
		}
		return h
	}

	const onResize = () => {
		setModalHeight(getModalHeight())
	}

	// Resize modal on state change.
	useEffect(() => {
		onResize()
	}, [unclaimedRewards.total, section])

	// Resize this modal on window resize.
	useEffect(() => {
		window.addEventListener('resize', resizeCallback)
		return () => {
			window.removeEventListener('resize', resizeCallback)
		}
	}, [])
	const resizeCallback = () => {
		onResize()
	}

	return (
		<Section type="carousel">
			<FixedTitle ref={headerRef}>
				<ModalTitle title={t('claimPayouts')} fixed />
			</FixedTitle>
			<MultiTwo
				style={{
					maxHeight: modalMaxHeight - (headerRef.current?.clientHeight || 0),
				}}
				animate={sectionRef.current === 0 ? 'home' : 'next'}
				transition={{
					duration: 0.5,
					type: 'spring' as const,
					bounce: 0.1,
				}}
				variants={{
					home: {
						left: 0,
					},
					next: {
						left: '-100%',
					},
				}}
			>
				<Multi>
					<Overview
						setSection={setSection}
						setPayouts={setPayouts}
						ref={overviewRef}
					/>
				</Multi>
				<Multi>
					<Forms
						ref={formsRef}
						payouts={payouts}
						setPayouts={setPayouts}
						setSection={setSection}
						onResize={onResize}
					/>
				</Multi>
			</MultiTwo>
		</Section>
	)
}
