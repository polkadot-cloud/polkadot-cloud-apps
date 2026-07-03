// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { onTabVisitEvent } from 'event-tracking'
import { usePlugins } from 'hooks/usePlugins'
import { PageTabs } from 'library/PageTabs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { Active } from './Active'
import { NominationGeo } from './NominationGeo'
import { Wrapper } from './Wrappers'

export const Nominate = () => {
	const { t } = useTranslation()
	const { pluginEnabled } = usePlugins()

	const [activeTab, setActiveTab] = useState<number>(0)

	// Go back to the first tab if the Polkawatch plugin is disabled
	useEffect(() => {
		if (!pluginEnabled('polkawatch')) {
			setActiveTab(0)
		}
	}, [pluginEnabled('polkawatch')])

	return (
		<Wrapper>
			<Page.Title title={t('nominate', { ns: 'pages' })}>
				<PageTabs
					tabs={
						pluginEnabled('polkawatch')
							? [
									{
										title: t('overview', { ns: 'app' }),
										active: activeTab === 0,
										onClick: () => {
											onTabVisitEvent('nominate', 'overview')
											setActiveTab(0)
										},
									},
									{
										title: t('decentralization', { ns: 'app' }),
										active: activeTab === 1,
										onClick: () => {
											onTabVisitEvent('nominate', 'decentralization')
											setActiveTab(1)
										},
									},
								]
							: undefined
					}
				/>
			</Page.Title>
			{activeTab === 0 && <Active />}
			{activeTab === 1 && <NominationGeo />}
		</Wrapper>
	)
}
