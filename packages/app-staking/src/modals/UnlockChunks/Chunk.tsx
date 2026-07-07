// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheckCircle, faClock } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useTimeLeft } from '@w3ux/hooks'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { fromUnixTime } from 'date-fns'
import { useApi } from 'hooks/useApi'
import { useErasToTimeLeft } from 'hooks/useErasToTimeLeft'
import { useEraTimeLeft } from 'hooks/useEraTimeLeft'
import { useNetwork } from 'hooks/useNetwork'
import { useUnbondDuration } from 'hooks/useUnbondDuration'
import { Countdown } from 'library/Countdown'
import { ProgressBar } from 'library/ProgressBar'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSubmit } from 'ui-buttons'
import { formatTimeleft, planckToUnitBn } from 'utils'
import type { ChunkProps } from './types'
import { ChunkWrapper } from './Wrappers'

export const Chunk = ({ chunk, bondFor, onRebond }: ChunkProps) => {
	const { t, i18n } = useTranslation('modals')

	const { getConsts, activeEra } = useApi()
	const { network } = useNetwork()
	const { activeAddress } = useActiveAccount()
	const { erasToSeconds } = useErasToTimeLeft()
	const { get: getEraTimeleft } = useEraTimeLeft()

	const { timeleft, setFromNow } = useTimeLeft({
		depsTimeleft: [network],
		depsFormat: [i18n.resolvedLanguage],
	})

	const { unit, units } = getStakingChainData(network)
	const { bondDuration } = getConsts(network)
	const { unbondDuration } = useUnbondDuration()
	const isStaking = bondFor === 'nominator'
	const { era, value } = chunk
	const left = new BigNumber(era).minus(activeEra.index)
	const start = Number(activeEra.start / 1000n)
	const erasDuration = erasToSeconds(left.toNumber())

	const dateFrom = fromUnixTime(start)
	const dateTo = fromUnixTime(start + erasDuration)
	const formatted = formatTimeleft(t, timeleft.raw)

	// Calculate unbonding progress percentage. Chunks unlocking within the
	// effective unbond duration span that duration; chunks with more eras
	// remaining (validators, or chunks created before fast unbonding was
	// enabled) span the full bond duration.
	const isUnlocked = left.isLessThanOrEqualTo(0)
	const chunkDuration = left.isGreaterThan(unbondDuration)
		? bondDuration
		: unbondDuration
	const startEra = era - chunkDuration
	const erasCompleted = activeEra.index - startEra

	// Add sub-era interpolation so the bar moves within the current era.
	const { percentSurpassed } = getEraTimeleft()
	const subEraFraction = percentSurpassed / 100

	const progress = isUnlocked
		? 100
		: Math.min(
				100,
				Math.max(0, ((erasCompleted + subEraFraction) / chunkDuration) * 100),
			)
	const progressRounded = Math.round(progress)

	// reset timer on account, network, or era change.
	useEffect(() => {
		setFromNow(dateFrom, dateTo)
	}, [activeAddress, network, activeEra])

	return (
		<ChunkWrapper>
			<div>
				<div className="chunk-header">
					<h2>{`${planckToUnitBn(new BigNumber(value), units)} ${unit}`}</h2>
					{isStaking && (
						<ButtonSubmit text={t('rebond')} onClick={() => onRebond(chunk)} />
					)}
				</div>
				<div className={isUnlocked ? 'status-line ready' : 'status-line'}>
					<FontAwesomeIcon icon={isUnlocked ? faCheckCircle : faClock} />
					{isUnlocked ? (
						t('readyToWithdraw')
					) : (
						<Countdown timeleft={formatted} markup={false} />
					)}
				</div>
				<ProgressBar
					progress={progress}
					status={isUnlocked ? 'complete' : 'active'}
					ariaLabel={
						isUnlocked
							? t('readyToWithdraw')
							: t('unbondingProgress', { percent: progressRounded })
					}
				/>
				{!isUnlocked && (
					<div className="chunk-bar-labels">
						<span>{`${t('unlocksInEra')} ${era}`}</span>
						<span>{`${progressRounded}%`}</span>
					</div>
				)}
			</div>
		</ChunkWrapper>
	)
}
