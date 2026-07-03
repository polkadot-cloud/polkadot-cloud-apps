// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheckCircle, faClock } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { getUnixTime } from 'date-fns'
import { useApi } from 'hooks/useApi'
import { useErasToTimeLeft } from 'hooks/useErasToTimeLeft'
import { useNetwork } from 'hooks/useNetwork'
import { StatsWrapper, StatWrapper } from 'library/Modal/Wrappers'
import { StaticNote } from 'modals/Utils/StaticNote'
import type { Dispatch, ForwardedRef, SetStateAction } from 'react'
import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondFor, UnlockChunk } from 'types'
import { ButtonSubmit } from 'ui-buttons'
import { Notes, Padding } from 'ui-core/modal'
import { timeleftAsString } from 'utils'
import { Chunk } from './Chunk'
import { ContentWrapper } from './Wrappers'

interface OverviewProps {
	unlocking: UnlockChunk[]
	bondFor: BondFor
	setSection: (section: number) => void
	setUnlock: Dispatch<SetStateAction<UnlockChunk | null>>
	setTask: (task: string) => void
}

export const Overview = forwardRef(
	(
		{ unlocking, bondFor, setSection, setUnlock, setTask }: OverviewProps,
		ref: ForwardedRef<HTMLDivElement>,
	) => {
		const { t } = useTranslation('modals')
		const { network } = useNetwork()
		const { getConsts, activeEra } = useApi()
		const { bondDuration } = getConsts(network)
		const { erasToSeconds } = useErasToTimeLeft()

		const { unit, units } = getStakingChainData(network)
		const bondDurationFormatted = timeleftAsString(
			t,
			getUnixTime(new Date()) + 1,
			erasToSeconds(bondDuration),
			true,
		)

		const isStaking = bondFor === 'nominator'

		let withdrawAvailable = 0n
		let totalUnbonding = 0n
		let hasActiveUnbonding = false
		for (const c of unlocking) {
			const { era, value } = c
			const left = era - activeEra.index

			totalUnbonding = totalUnbonding + value
			if (left <= 0n) {
				withdrawAvailable = withdrawAvailable + value
			} else {
				hasActiveUnbonding = true
			}
		}

		const hasUnlocked = withdrawAvailable > 0n

		// Single shared ticker: re-render every 60s while any chunk is actively
		// unbonding so child progress bars advance within the current era.
		const [, setTick] = useState(0)
		useEffect(() => {
			if (!hasActiveUnbonding) return
			const id = setInterval(() => setTick((t) => t + 1), 60_000)
			return () => clearInterval(id)
		}, [hasActiveUnbonding])

		const onRebondHandler = (chunk: UnlockChunk) => {
			setTask('rebond')
			setUnlock(chunk)
			setSection(1)
		}

		return (
			<ContentWrapper>
				<Padding horizontalOnly ref={ref}>
					<StatsWrapper>
						<StatWrapper>
							<div className="inner">
								<h4 className={hasUnlocked ? 'has-unlocked' : undefined}>
									<FontAwesomeIcon icon={faCheckCircle} className="icon" />{' '}
									{t('unlocked')}
								</h4>
								<h2>
									{new BigNumber(planckToUnit(withdrawAvailable, units))
										.decimalPlaces(3)
										.toFormat()}{' '}
									{unit}
								</h2>
							</div>
						</StatWrapper>
						<StatWrapper>
							<div className="inner">
								<h4>
									<FontAwesomeIcon icon={faClock} className="icon" />{' '}
									{t('unbonding')}
								</h4>
								<h2>
									{new BigNumber(
										planckToUnit(totalUnbonding - withdrawAvailable, units),
									)
										.decimalPlaces(3)
										.toFormat()}{' '}
									{unit}
								</h2>
							</div>
						</StatWrapper>
						<StatWrapper>
							<div className="inner">
								<h4>{t('total')}</h4>
								<h2>
									{new BigNumber(planckToUnit(totalUnbonding, units))
										.decimalPlaces(3)
										.toFormat()}{' '}
									{unit}
								</h2>
							</div>
						</StatWrapper>
					</StatsWrapper>

					{hasUnlocked && (
						<div className="withdraw-action">
							<ButtonSubmit
								text={t('withdrawUnlocked')}
								onClick={() => {
									setTask('withdraw')
									setUnlock({
										era: 0,
										value: withdrawAvailable,
									})
									setSection(1)
								}}
							/>
						</div>
					)}

					{unlocking.map((chunk) => (
						<Chunk
							key={`unlock_chunk_${chunk.era}`}
							chunk={chunk}
							bondFor={bondFor}
							onRebond={onRebondHandler}
						/>
					))}
					<Notes withPadding>
						<StaticNote
							value={bondDurationFormatted}
							tKey="unlockTake"
							valueKey="bondDurationFormatted"
							deps={[bondDuration]}
						/>
						<p> {isStaking ? ` ${t('rebondUnlock')}` : null}</p>
						{!isStaking ? <p>{t('unlockChunk')}</p> : null}
					</Notes>
				</Padding>
			</ContentWrapper>
		)
	},
)

Overview.displayName = 'Overview'
