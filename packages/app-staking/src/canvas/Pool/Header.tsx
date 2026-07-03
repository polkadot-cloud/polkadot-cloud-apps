// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn } from '@w3ux/utils'
import { PerbillMultiplier } from 'consts'
import { onTabVisitEvent } from 'event-tracking'
import { PageTabs } from 'library/PageTabs'
import { useTranslation } from 'react-i18next'
import type { PoolState } from 'types'
import { AccountTitle, HeadTags } from 'ui-core/canvas'
import type { HeaderProps } from './types'
export const Header = ({
	activeTab,
	bondedPool,
	metadata,
	autoSelected,
	setActiveTab,
}: HeaderProps) => {
	const { t } = useTranslation()
	const poolCommission = bondedPool.commission?.current?.[0]

	// Pool state to tag class
	const getTagClass = (state: PoolState) => {
		switch (state) {
			case 'Blocked':
				return 'warning'
			case 'Destroying':
				return 'danger'
			default:
				return ''
		}
	}

	// Render title as metadata, or fallback to clipped stash address
	const title = metadata || ellipsisFn(bondedPool.addresses.stash)

	return (
		<AccountTitle>
			<div>
				<div>
					<Polkicon
						address={bondedPool.addresses.stash || ''}
						background="transparent"
						fontSize="4rem"
					/>
				</div>
				<div>
					<div className="title">
						<h1>{title}</h1>
					</div>
					<HeadTags>
						<h3>
							{t('pool', { ns: 'app' })} {bondedPool.id}
						</h3>
						{['Blocked', 'Destroying'].includes(bondedPool.state) && (
							<h3>
								<span className={getTagClass(bondedPool.state)}>
									{t(bondedPool.state.toLowerCase(), { ns: 'app' })}
								</span>
							</h3>
						)}
						{poolCommission && (
							<h3>
								<span>
									{poolCommission / PerbillMultiplier}%{' '}
									{t('commission', { ns: 'modals' })}
								</span>
							</h3>
						)}
						{autoSelected && (
							<h3>
								<span>{t('autoSelected', { ns: 'app' })}</span>
							</h3>
						)}
					</HeadTags>
				</div>
			</div>
			<PageTabs
				sticky={false}
				tabs={[
					{
						title: t('overview', { ns: 'pages' }),
						active: activeTab === 0,
						onClick: () => {
							onTabVisitEvent('pool_canvas', 'overview')
							setActiveTab(0)
						},
					},
					{
						title: t('nominations', { ns: 'pages' }),
						active: activeTab === 1,
						onClick: () => {
							onTabVisitEvent('pool_canvas', 'nominations')
							setActiveTab(1)
						},
					},
				]}
				tabClassName="canvas"
				inline={true}
				colorSecondary={true}
			/>
		</AccountTitle>
	)
}
