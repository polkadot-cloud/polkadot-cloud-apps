// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getChainIcons } from 'assets'
import { getStakingChainData } from 'consts/util'
import { useAverageRewardRate } from 'hooks/useAverageRewardRate'
import { useNetwork } from 'hooks/useNetwork'
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

export const RewardCalculator = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { config } = useOverlay().modal
	const { getAverageRewardRate } = useAverageRewardRate()

	const { unit } = getStakingChainData(network)
	const Token = getChainIcons(network).token
	const { currency } = config.options

	// Store token amount to stake
	const [stakeAmount, setStakeAmount] = useState<number>(DEFAULT_TOKEN_INPUT)

	const annualReward = stakeAmount * (getAverageRewardRate() / 100) || 0
	const monthlyReward = annualReward / 12
	const dailyReward = annualReward / 365

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const isNumber = !isNaN(Number(e.target.value))
		if (!isNumber) {
			return
		}
		setStakeAmount(Number(e.target.value))
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
						placeholder={t('stakePlaceholder', { ns: 'pages' })}
						value={String(stakeAmount || 0)}
						marginY
					/>
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
