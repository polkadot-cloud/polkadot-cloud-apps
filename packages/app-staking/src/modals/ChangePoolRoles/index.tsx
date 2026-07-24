// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import { SubmitTx } from 'ui-app/SubmitTx'
import { Padding, RoleChange, Title } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'

export const ChangePoolRoles = () => {
	const { t } = useTranslation('modals')
	const { serviceApi } = useApi()
	const { activeProxy } = useActiveProxy()
	const { replacePoolRoles } = useBondedPools()
	const { activeAccount } = useActiveAccount()
	const {
		closeModal,
		config: { options },
	} = useOverlay().modal
	const { id: poolId, roleEdits } = options

	const getTx = () =>
		serviceApi.tx.poolUpdateRoles(poolId, {
			root: roleEdits?.root?.newAddress || undefined,
			nominator: roleEdits?.nominator?.newAddress || undefined,
			bouncer: roleEdits?.bouncer?.newAddress || undefined,
		})

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: true,
		callbackSubmit: () => {
			closeModal()
		},
		callbackInBlock: () => {
			// manually update bondedPools with new pool roles
			replacePoolRoles(poolId, roleEdits)
		},
	})

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('changePoolRoles')}</Title>
				<Padding verticalOnly>
					<RoleChange
						roleName={t('root')}
						oldAddress={roleEdits?.root?.oldAddress}
						newAddress={roleEdits?.root?.newAddress}
					/>
					<RoleChange
						roleName={t('nominator')}
						oldAddress={roleEdits?.nominator?.oldAddress}
						newAddress={roleEdits?.nominator?.newAddress}
					/>
					<RoleChange
						roleName={t('bouncer')}
						oldAddress={roleEdits?.bouncer?.oldAddress}
						newAddress={roleEdits?.bouncer?.newAddress}
					/>
				</Padding>
			</Padding>
			<SubmitTx {...submitExtrinsic} valid />
		</>
	)
}
