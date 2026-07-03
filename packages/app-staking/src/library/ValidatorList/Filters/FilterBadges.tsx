// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useFilters } from 'contexts/Filters'
import { useValidatorFilters } from 'hooks/useValidatorFilters'
import { Container } from 'library/Filter/Container'
import { Item } from 'library/Filter/Item'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const FilterBadges = () => {
	const { t } = useTranslation('app')
	const { getFilters, getOrder, toggleFilter } = useFilters()
	const { includesToLabels, excludesToLabels, ordersToLabels } =
		useValidatorFilters()

	const includes = getFilters('include', 'validators')
	const excludes = getFilters('exclude', 'validators')
	const hasFilters = includes?.length || excludes?.length
	const order = getOrder('validators')

	// scroll to top of the window on every filter.
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [includes, excludes])

	return (
		<Container>
			<div className="items">
				<Item
					label={
						order === 'default'
							? `${t('unordered')}`
							: `${t('order')}: ${ordersToLabels[order]}`
					}
					disabled
				/>
				{!hasFilters && <Item label={t('noFilters')} disabled />}
				{includes?.map((e) => (
					<Item
						key={`validator_include_${e}`}
						label={includesToLabels[e]}
						icon={faCheck}
						onClick={() => {
							toggleFilter('include', 'validators', e)
						}}
					/>
				))}
				{excludes?.map((e) => (
					<Item
						key={`validator_exclude_${e}`}
						label={excludesToLabels[e]}
						icon={faBan}
						transform="shrink-2"
						onClick={() => {
							toggleFilter('exclude', 'validators', e)
						}}
					/>
				))}
			</div>
		</Container>
	)
}
