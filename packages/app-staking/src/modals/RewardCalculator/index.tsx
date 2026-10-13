// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit } from '@polkadot-cloud/utils'
import { getChainIcons } from 'assets'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useAverageRewardRate } from 'hooks/useAverageRewardRate'
import { useNetwork } from 'hooks/useNetwork'
import { useStakingMetrics } from 'hooks/useStakingMetrics'
import { useValidatorRewardProjection } from 'hooks/useValidatorRewardProjection'
import { Balance } from 'library/Balance'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalTitle } from 'ui-app/ModalTitle'
import { CardHeader, Separator } from 'ui-core/base'
import { TokenInput } from 'ui-core/input'
import { Padding } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { ContentWrapper } from '../Networks/Wrapper'

const DEFAULT_TOKEN_INPUT = 1000
const MIN_VALIDATOR_DOT = 10_000

export const RewardCalculator = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { activeAddress } = useActiveAccount()
	const { config } = useOverlay().modal
	const { getAverageRewardRate } = useAverageRewardRate()
	const { balances } = useAccountBalances(activeAddress)
	const { minValidatorBond } = useStakingMetrics()
	const validatorProjection = useValidatorRewardProjection()
	const { accountIsValidator } = validatorProjection

	const { unit, units } = getStakingChainData(network)
	const Token = getChainIcons(network).token
	const { currency } = config.options

	// Store token amount to stake
	const [inputStakeAmount, setInputStakeAmount] = useState<number | null>(null)
	const minimumStakeAmount = accountIsValidator
		? Math.max(
				network === 'polkadot' ? MIN_VALIDATOR_DOT : 0,
				Number(planckToUnit(minValidatorBond, units)),
			)
		: 0
	const stakeAmount =
		inputStakeAmount ?? Math.max(DEFAULT_TOKEN_INPUT, minimumStakeAmount)
	const belowMinimum = accountIsValidator && stakeAmount < minimumStakeAmount

	const currentStake = Number(planckToUnit(balances.nominator.active, units))
	const rewardRate = accountIsValidator
		? currentStake > 0
			? validatorProjection.annualReward / currentStake
			: 0
		: getAverageRewardRate() / 100

	const annualReward = stakeAmount * rewardRate || 0
	const monthlyReward = annualReward / 12
	const dailyReward = annualReward / 365

	const rewardBalance = (value: number) =>
		validatorProjection.loading ? (
			<h3>{t('syncing', { ns: 'app' })}</h3>
		) : validatorProjection.unavailable || belowMinimum ? (
			<h3>—</h3>
		) : (
			<Balance.WithFiat Token={<Token />} value={value} currency={currency} />
		)

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value)
		if (!Number.isFinite(value)) {
			return
		}
		setInputStakeAmount(value)
	}

	return (
		<div style={{ padding: '0 0.5rem' }}>
			<ModalTitle
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
						onBlur={() => {
							if (belowMinimum) {
								setInputStakeAmount(minimumStakeAmount)
							}
						}}
						placeholder={t('stakePlaceholder', { ns: 'pages' })}
						value={String(stakeAmount || 0)}
						marginY
					/>
					{belowMinimum && (
						<h4 role="alert">
							{t('minimumBond', {
								ns: 'app',
								minBondUnit: minimumStakeAmount.toLocaleString(),
								unit,
							})}
						</h4>
					)}
					<Separator lg />
					<CardHeader>
						<h4>
							{t('daily', { ns: 'pages' })} {t('rewards', { ns: 'modals' })}
						</h4>
						{rewardBalance(dailyReward)}
					</CardHeader>
					<Separator lg />
					<CardHeader>
						<h4>
							{t('monthly', { ns: 'pages' })} {t('rewards', { ns: 'modals' })}
						</h4>
						{rewardBalance(monthlyReward)}
					</CardHeader>
					<Separator lg />
					<CardHeader>
						<h4>
							{t('annual', { ns: 'pages' })} {t('rewards', { ns: 'modals' })}
						</h4>
						{rewardBalance(annualReward)}
					</CardHeader>
					<Separator transparent style={{ marginTop: '2.5rem' }} />
				</ContentWrapper>
			</Padding>
		</div>
	)
}
