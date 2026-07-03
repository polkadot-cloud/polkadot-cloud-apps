// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCog } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useActiveAccountPool } from 'hooks/useActiveAccountPool'
import { useApi } from 'hooks/useApi'
import { Stat } from 'library/Stat'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'
import type { MembershipStatusProps } from './types'

export const MembershipStatus = ({
	showButtons = true,
	buttonType = 'primary',
}: MembershipStatusProps) => {
	const { t } = useTranslation('pages')
	const { isReady } = useApi()
	const { openModal } = useOverlay().modal
	const { activeAddress } = useActiveAccount()
	const { isReadOnlyAccount } = useImportedAccounts()
	const { inPool, canManage, activePool, membershipDisplay, label } =
		useActiveAccountPool()

	const membershipButtons = []

	if (inPool && canManage) {
		if (!isReadOnlyAccount(activeAddress)) {
			membershipButtons.push({
				title: t('manage'),
				icon: faCog,
				disabled: !isReady,
				small: true,
				onClick: () =>
					openModal({
						key: 'ManagePool',
						options: { disableWindowResize: true, disableScroll: true },
						size: 'sm',
					}),
			})
		}
	}

	return activePool ? (
		<Stat
			label={label}
			helpKey="Pool Membership"
			type="address"
			stat={{
				address: activePool?.addresses?.stash ?? '',
				display: membershipDisplay,
			}}
			buttons={showButtons ? membershipButtons : []}
		/>
	) : (
		<Stat
			label={t('poolMembership')}
			helpKey="Pool Membership"
			stat={t('notInPool')}
			buttonType={buttonType}
		/>
	)
}
