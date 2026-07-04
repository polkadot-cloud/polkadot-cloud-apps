// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useStakingAccountCategories } from 'hooks/useStakingAccountCategories'
import { Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionItem, CustomHeader, Padding } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'
import { AccountItem } from './AccountItem'
import type { AccountsProps } from './types'
import { getCategoryResizeKey } from './util'
import { AccountSeparator, AccountWrapper } from './Wrappers'

export const Accounts = ({
	useCategories = useStakingAccountCategories,
}: AccountsProps = {}) => {
	const { t } = useTranslation('modals')
	const categories = useCategories()
	const { activeProxy } = useActiveProxy()
	const { accounts } = useImportedAccounts()
	const { activeAddress } = useActiveAccount()
	const categoryResizeKey = getCategoryResizeKey(categories)
	const { status: modalStatus, setModalResize } = useOverlay().modal

	// Resize if modal open upon state changes.
	useEffect(() => {
		if (modalStatus === 'open') {
			setModalResize()
		}
	}, [accounts, activeAddress, activeProxy, categoryResizeKey])

	return (
		<>
			<Close />
			<Padding>
				<CustomHeader>
					<div>
						<h1>{t('accounts')}</h1>
					</div>
				</CustomHeader>
				{!activeAddress && !accounts.length && (
					<AccountWrapper style={{ marginTop: '1.5rem' }}>
						<div>
							<div>
								<h4 style={{ padding: '0.75rem 1rem' }}>
									{t('noActiveAccount')}
								</h4>
							</div>
							<div />
						</div>
					</AccountWrapper>
				)}
				{categories.map(({ key, labelKey, items }) =>
					items.length ? (
						<Fragment key={key}>
							<AccountSeparator />
							{labelKey && <ActionItem text={t(labelKey)} />}
							{items.map((item) => (
								<AccountItem
									key={`acc_${key}_${item.address}_${item.source}`}
									{...item}
								/>
							))}
						</Fragment>
					) : null,
				)}
			</Padding>
		</>
	)
}
