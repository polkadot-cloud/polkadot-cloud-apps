// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { usePoolStats } from 'hooks/useStats'
import { NominationRetainmentWarning } from 'library/NominationRetainmentWarning'
import { PageWarnings } from 'library/PageWarnings'
import { Stats } from 'library/Stats'
import { useTranslation } from 'react-i18next'
import { Stat } from 'ui-app/Stat'
import { Page } from 'ui-core/base'
import { PoolOverview } from './Overview'

export const Pools = () => {
	const { t } = useTranslation('pages')
	const { activePools, minimumToJoinPool, minimumToCreatePool } = usePoolStats()

	return (
		<>
			<Page.Title title={t('pool', { ns: 'app' })}></Page.Title>
			<PageWarnings />
			<NominationRetainmentWarning bondFor="pool" />
			<Stat.Row>
				<Stats items={[activePools, minimumToJoinPool, minimumToCreatePool]} />
			</Stat.Row>
			<PoolOverview />
		</>
	)
}
