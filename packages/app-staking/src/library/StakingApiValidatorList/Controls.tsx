// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSecondary, ButtonSubmit } from 'ui-buttons'
import { ApiFilters, FilterSwitches } from './Filters'
import {
	type BrowserFilters,
	DEFAULT_VALIDATOR_LIST_CONFIG,
	filtersChanged,
	UNFILTERED_CONFIG,
	updateFilters,
	type ValidatorListConfig,
} from './filtersConfig'
import {
	Actions,
	ConfigRow,
	ControlsForm,
	OrderField,
	OrderTab,
	OrderTabs,
	SearchField,
} from './styles'

interface ControlsProps {
	apiFilters?: boolean
	config: ValidatorListConfig
	disabled: boolean
	onApply: (config: ValidatorListConfig) => void
	orderOptions?: Array<{ key: string; label: string }>
}

export const Controls = ({
	apiFilters = false,
	config,
	disabled,
	onApply,
	orderOptions: suppliedOrderOptions,
}: ControlsProps) => {
	const { t } = useTranslation('app')
	const [draft, setDraft] = useState(config)

	const filterProps = {
		filters: draft.filters,
		onChange: (changes: Partial<BrowserFilters>) =>
			setDraft((current) => ({
				...current,
				filters: updateFilters(current.filters, changes),
			})),
	}
	const orderOptions = suppliedOrderOptions ?? [
		{ key: 'RETAINMENT_HIGH', label: t('highRetainment') },
		{ key: 'RETAINMENT_LOW', label: t('lowRetainment') },
		{ key: 'ACTIVITY', label: t('activity') },
	]
	const nextConfig = { ...draft, search: draft.search.trim() }
	const canApply =
		!disabled &&
		(nextConfig.search !== config.search ||
			nextConfig.order !== config.order ||
			filtersChanged(draft.filters, config.filters))
	const apply = () => {
		if (canApply) onApply(nextConfig)
	}
	const clear = () => {
		const preferred = orderOptions.find(
			({ key }) => key === DEFAULT_VALIDATOR_LIST_CONFIG.order,
		)
		setDraft({
			...UNFILTERED_CONFIG,
			order: preferred?.key ?? orderOptions[0]?.key ?? config.order,
		})
	}

	return (
		<ControlsForm
			onSubmit={(event) => {
				event.preventDefault()
				apply()
			}}
		>
			<SearchField>
				<input
					type="search"
					value={draft.search}
					aria-label={t('validatorSearch.searchValidators')}
					placeholder={t('searchAddress')}
					onChange={({ currentTarget: { value } }) =>
						setDraft((current) => ({ ...current, search: value }))
					}
				/>
			</SearchField>
			{apiFilters && <ApiFilters {...filterProps} />}
			<ConfigRow $apiFilters={apiFilters}>
				{!apiFilters && <FilterSwitches {...filterProps} includeActive />}
				<OrderField>
					<legend>{t('order')}</legend>
					<OrderTabs
						$columns={orderOptions.length}
						role="tablist"
						aria-label={t('order')}
					>
						{orderOptions.map(({ key, label }) => (
							<OrderTab
								key={key}
								type="button"
								role="tab"
								aria-selected={draft.order === key}
								onClick={() =>
									setDraft((current) => ({ ...current, order: key }))
								}
							>
								{label}
							</OrderTab>
						))}
					</OrderTabs>
				</OrderField>
				<Actions>
					<ButtonSecondary text={t('clear')} onClick={clear} />
					<ButtonSubmit
						text={t('apply')}
						disabled={!canApply}
						pulse={canApply}
						onClick={apply}
					/>
				</Actions>
			</ConfigRow>
		</ControlsForm>
	)
}
