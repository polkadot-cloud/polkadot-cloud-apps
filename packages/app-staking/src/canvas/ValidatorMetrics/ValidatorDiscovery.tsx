// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AnnouncementsList } from 'library/Announcements/AnnouncementsList'
import { useValidatorDiscovery } from 'plugin-staking-api'
import { useTranslation } from 'react-i18next'
import type { NetworkId } from 'types'

export const ValidatorDiscovery = ({
	network,
	address,
}: {
	network: NetworkId
	address: string
}) => {
	const { t } = useTranslation('app')
	const { data, loading, error } = useValidatorDiscovery({
		network,
		addresses: [address],
	})
	const discovery = error
		? undefined
		: data.getValidatorDiscovery.find((entry) => entry.address === address)

	return (
		<div style={{ marginTop: '1rem' }}>
			<AnnouncementsList
				items={
					loading
						? [null, null]
						: [
								{
									label: t('countryCode'),
									value: discovery?.countryCode || t('notAvailable'),
								},
								{
									label: t('cloudProvider'),
									value: discovery?.cloudProvider || t('notAvailable'),
								},
							]
				}
			/>
		</div>
	)
}
