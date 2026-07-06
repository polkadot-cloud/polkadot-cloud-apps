// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faLockOpen } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActivePool } from 'hooks/useActivePool'
import { useThemeValues } from 'hooks/useThemeValues'
import { useUnbondDuration } from 'hooks/useUnbondDuration'
import { CardWrapper } from 'library/Card/Wrappers'
import { useTranslation } from 'react-i18next'
import type { BondFor } from 'types'
import { ButtonPrimary } from 'ui-buttons'
import { ButtonRow, Page } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'

export const WithdrawPrompt = ({ bondFor }: { bondFor: BondFor }) => {
	const { t } = useTranslation('modals')
	const { activePool } = useActivePool()
	const { openModal } = useOverlay().modal
	const { getThemeValue } = useThemeValues()

	const { activeAddress } = useActiveAccount()
	const { formatUnbondDuration } = useUnbondDuration()
	const { state } = activePool?.bondedPool || {}

	const { balances } = useAccountBalances(activeAddress)

	const totalUnlockChunks =
		bondFor === 'nominator'
			? balances.nominator.totalUnlockChunks
			: balances.pool.totalUnlockChunks

	const unbondDurationFormatted = formatUnbondDuration(t)

	// Check whether there are active unlock chunks.
	const displayPrompt = totalUnlockChunks > 0

	return (
		/* NOTE: WithdrawPrompt allows withdrawals regardless of pool state after unbonding period. */
		displayPrompt && (
			<Page.Row>
				<CardWrapper
					style={{
						border: `1px solid ${getThemeValue('--gray-1000')}`,
					}}
				>
					<div className="content">
						<h3>{t('unlocksInProgress')}</h3>
						<h4>
							{t('youHaveActiveUnlocks', {
								bondDurationFormatted: unbondDurationFormatted,
							})}
						</h4>
						<ButtonRow yMargin>
							<ButtonPrimary
								iconLeft={faLockOpen}
								text={t('manageUnlocks')}
								disabled={false}
								onClick={() =>
									openModal({
										key: 'UnlockChunks',
										options: {
											bondFor,
											disableWindowResize: true,
											disableScroll: true,
											// NOTE: Properly handle pool closure state for destroying pools.
											poolClosure: state === 'Destroying',
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
