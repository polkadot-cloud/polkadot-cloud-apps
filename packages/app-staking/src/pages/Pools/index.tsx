// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { usePoolStats } from 'hooks/useStats'
import { PageWarnings } from 'library/PageWarnings'
import { Stats } from 'library/Stats'
import { useTranslation } from 'react-i18next'
import { Page, Stat } from 'ui-core/base'
import { PoolOverview } from './Overview'

export const Pools = () => {
	const { t } = useTranslation('pages')
	const { activePools, minimumToJoinPool, minimumToCreatePool } = usePoolStats()

	return (
		<>
			<Page.Title title={t('pool', { ns: 'app' })}></Page.Title>
			<PageWarnings />
			<Stat.Row>
				<Stats items={[activePools, minimumToJoinPool, minimumToCreatePool]} />
			</Stat.Row>
			<PoolOverview />
		</>
	)
}
