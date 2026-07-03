// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getChainIcons } from 'assets'
import { getStakingChainData } from 'consts/util'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useAverageRewardRate } from 'hooks/useAverageRewardRate'
import { useNetwork } from 'hooks/useNetwork'
import { Balance } from 'library/Balance'
import { Title } from 'library/Modal/Title'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardHeader, Separator } from 'ui-core/base'
import { TokenInput } from 'ui-core/input'
import { Padding } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { ContentWrapper } from '../Networks/Wrapper'

const DEFAULT_TOKEN_INPUT = 1000

export const RewardCalculator = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { config } = useOverlay().modal
	const { avgCommission } = useValidators()
	const { getAverageRewardRate } = useAverageRewardRate()

	const { unit } = getStakingChainData(network)
	const Token = getChainIcons(network).token
	const { currency } = config.options

	// Store token amount to stake
	const [stakeAmount, setStakeAmount] = useState<number>(DEFAULT_TOKEN_INPUT)

	// Whether to show base or commission-adjusted rewards
	const [showAdjusted, setShowCommissionAdjusted] = useState<boolean>(false)

	const annualRewardBase = stakeAmount * (getAverageRewardRate() / 100) || 0

	const annualRewardAfterCommission =
		annualRewardBase * (1 - avgCommission / 100)
	const monthlyRewardAfterCommission = annualRewardAfterCommission / 12
	const dailyRewardAfterCommission = annualRewardAfterCommission / 365

	const annualReward = showAdjusted
		? annualRewardAfterCommission
		: annualRewardBase

	const monthlyReward = showAdjusted
		? monthlyRewardAfterCommission
		: annualRewardBase / 12
	const dailyReward = showAdjusted
		? dailyRewardAfterCommission
		: annualRewardBase / 365

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const isNumber = !isNaN(Number(e.target.value))
		if (!isNumber) {
			return
		}
		setStakeAmount(Number(e.target.value))
	}

	return (
		<div style={{ padding: '0 0.5rem' }}>
			<Title
				title={t('rewardCalculator', { ns: 'pages' })}
				paddingLeft="0.5rem"
			/>
			<Padding horizontalOnly>
				<ContentWrapper>
					<h4>{t('rewardCalcSubtitle', { ns: 'pages', unit })}</h4>
					<TokenInput
						id="reward-calc-token-input"
						label={`${t('unitAmount', { ns: 'pages', unit })}`}
						onChange={onChange}
						placeholder={t('stakePlaceholder', { ns: 'pages' })}
						value={String(stakeAmount || 0)}
						marginY
					/>{' '}
					<h3 style={{ padding: '0 0.5rem' }}>
						<button
							type="button"
							onClick={() => setShowCommissionAdjusted(!showAdjusted)}
						>
							<FontAwesomeIcon
								icon={showAdjusted ? faToggleOn : faToggleOff}
								style={{
									color: showAdjusted
										? 'var(--gray-1000)'
										: 'var(--text-tertiary)',
									marginRight: '0.8rem',
								}}
								transform={'grow-6'}
							/>
							{t('deductAvgCommissionOf', {
								ns: 'pages',
								commission: avgCommission,
							})}
						</button>
					</h3>
					<Separator lg />
					<CardHeader>
						<h4>
							{t('daily', { ns: 'pages' })} {t('rewards', { ns: 'modals' })}
						</h4>
						<Balance.WithFiat
							Token={<Token />}
							value={dailyReward}
							currency={currency}
						/>
					</CardHeader>
					<Separator lg />
					<CardHeader>
						<h4>
							{t('monthly', { ns: 'pages' })} {t('rewards', { ns: 'modals' })}
						</h4>
						<Balance.WithFiat
							Token={<Token />}
							value={monthlyReward}
							currency={currency}
						/>
					</CardHeader>
					<Separator lg />
					<CardHeader>
						<h4>
							{t('annual', { ns: 'pages' })} {t('rewards', { ns: 'modals' })}
						</h4>
						<Balance.WithFiat
							Token={<Token />}
							value={annualReward}
							currency={currency}
						/>
					</CardHeader>
					<Separator transparent style={{ marginTop: '2.5rem' }} />
				</ContentWrapper>
			</Padding>
		</div>
	)
}
