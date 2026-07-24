// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faLockOpen } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { useThemeValues } from 'hooks/useThemeValues'
import { CardWrapper } from 'library/Card/Wrappers'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from 'ui-buttons'
import { ButtonRow, Page } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'

export const UnstakePrompts = () => {
	const { t } = useTranslation('pages')
	const { syncing } = useSyncing()
	const { network } = useNetwork()
	const { openModal } = useOverlay().modal
	const { getThemeValue } = useThemeValues()
	const { activeAddress } = useActiveAccount()
	const { balances } = useAccountBalances(activeAddress)
	const { active, totalUnlockChunks, totalUnlocked, totalUnlocking } =
		balances.nominator

	const { unit } = getStakingChainData(network)

	// Is unlocking
	const isUnlocking = totalUnlockChunks > 0

	// unstaking can withdraw
	const canWithdrawUnlocks =
		active === 0n && totalUnlocking === 0n && totalUnlocked > 0n

	return (
		isUnlocking &&
		!syncing && (
			<Page.Row>
				<CardWrapper
					style={{
						border: `1px solid ${getThemeValue('--gray-1000')}`,
					}}
				>
					<div className="content">
						<h3>{t('unstakePromptInProgress')}</h3>
						<h4>
							{!canWithdrawUnlocks
								? t('unstakePromptWaitingForUnlocks')
								: `${t('unstakePromptReadyToWithdraw')} ${t(
										'unstakePromptRevert',
										{ unit },
									)}`}
						</h4>
						<ButtonRow yMargin>
							<ButtonPrimary
								iconLeft={faLockOpen}
								text={
									canWithdrawUnlocks
										? t('unlocked')
										: String(totalUnlockChunks ?? 0)
								}
								disabled={false}
								onClick={() =>
									openModal({
										key: 'UnlockChunks',
										options: {
											bondFor: 'nominator',
											poolClosure: true,
											disableWindowResize: true,
											disableScroll: true,
										},
										size: 'sm',
									})
								}
							/>
						</ButtonRow>
					</div>
				</CardWrapper>
			</Page.Row>
		)
	)
}
