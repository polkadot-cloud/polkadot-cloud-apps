// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useLedger } from '@polkadot-cloud/connect-ledger'
import { setStateWithRef } from '@w3ux/utils'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import { Title } from 'library/Modal/Title'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UnlockChunk } from 'types'
import { FixedTitle, Multi, MultiTwo, Section } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { Forms } from './Forms'
import { Overview } from './Overview'

export const UnlockChunks = () => {
	const { t } = useTranslation('modals')
	const {
		config: { options },
		setModalHeight,
		modalMaxHeight,
	} = useOverlay().modal
	const { integrityChecked } = useLedger()
	const { getStakingLedger } = useBalances()
	const { getPoolUnlocking } = useActivePool()
	const { activeAddress } = useActiveAccount()

	const { bondFor } = options || {}

	// get the unlocking per bondFor
	const getUnlocking = () => {
		let unlocking = []
		let stakingLedger
		switch (bondFor) {
			case 'pool':
				unlocking = getPoolUnlocking()
				break
			default:
				stakingLedger = getStakingLedger(activeAddress)
				unlocking = stakingLedger.ledger?.unlocking || []
		}
		return unlocking
	}

	const unlocking = getUnlocking()
	const [section, setSectionState] = useState<number>(0)
	const sectionRef = useRef(section)

	const setSection = (s: number) => {
		setStateWithRef(s, setSectionState, sectionRef)
	}

	// modal task
	const [task, setTask] = useState<string | null>(null)

	// unlock value of interest
	const [unlock, setUnlock] = useState<UnlockChunk | null>(null)

	// counter to trigger modal height calculation
	const [calculateHeight, setCalculateHeight] = useState<number>(0)
	const incrementCalculateHeight = () => setCalculateHeight(calculateHeight + 1)

	// refs for wrappers
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

	// resize modal on state change
	useEffect(() => {
		onResize()
	}, [task, calculateHeight, sectionRef.current, unlocking, integrityChecked])

	// resize this modal on window resize
	useEffect(() => {
		window.addEventListener('resize', onResize)
		return () => {
			window.removeEventListener('resize', onResize)
		}
	}, [])

	return (
		<Section type="carousel">
			<FixedTitle ref={headerRef}>
				<Title title={t('unlocks')} fixed />
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
						unlocking={unlocking}
						bondFor={bondFor}
						setSection={setSection}
						setUnlock={setUnlock}
						setTask={setTask}
						ref={overviewRef}
					/>
				</Multi>
				<Multi>
					<Forms
						incrementCalculateHeight={incrementCalculateHeight}
						setSection={setSection}
						unlock={unlock}
						task={task}
						ref={formsRef}
						onResize={onResize}
					/>
				</Multi>
			</MultiTwo>
		</Section>
	)
}
