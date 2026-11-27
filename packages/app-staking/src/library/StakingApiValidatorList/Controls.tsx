// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSecondary, ButtonSubmit } from 'ui-buttons'
import { ApiFilters, Exclusions, FilterSwitch } from './Filters'
import { type BrowserFilters, updateFilters } from './filtersConfig'
import {
	Actions,
	ConfigRow,
	ControlsForm,
	FilterButtons,
	FilterGroup,
	OrderField,
	OrderTab,
	OrderTabs,
	SearchField,
} from './styles'

export interface ValidatorListConfig {
	filters: BrowserFilters
	order: string
	search: string
}

export const DEFAULT_VALIDATOR_LIST_CONFIG: ValidatorListConfig = {
	filters: {
		excludeBlocked: true,
		excludeMissingIdentity: true,
	},
	order: 'RETAINMENT_HIGH',
	search: '',
}

const CLEARED_VALIDATOR_LIST_CONFIG: ValidatorListConfig = {
	filters: {
		excludeBlocked: false,
		excludeMissingIdentity: false,
	},
	order: 'RETAINMENT_HIGH',
	search: '',
}

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

	const changeFilters = (changes: Partial<BrowserFilters>) => {
		setDraft((current) => ({
			...current,
			filters: updateFilters(current.filters, changes),
		}))
	}
	const defaultOrderOptions = [
		{
			key: 'RETAINMENT_HIGH',
			label: t('highRetainment'),
		},
		{
			key: 'RETAINMENT_LOW',
			label: t('lowRetainment'),
		},
		{ key: 'ACTIVITY', label: t('activity') },
	]
	const orderOptions = suppliedOrderOptions ?? defaultOrderOptions
	const nextConfig = { ...draft, search: draft.search.trim() }
	const hasChanges =
		nextConfig.search !== config.search ||
		nextConfig.order !== config.order ||
		nextConfig.filters.active !== config.filters.active ||
		nextConfig.filters.matchAny?.join() !== config.filters.matchAny?.join() ||
		nextConfig.filters.excludeBlocked !== config.filters.excludeBlocked ||
		nextConfig.filters.excludeMissingIdentity !==
			config.filters.excludeMissingIdentity

	const apply = () => {
		if (!disabled && hasChanges) {
			onApply(nextConfig)
		}
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		apply()
	}

	const clear = () => {
		setDraft({
			...CLEARED_VALIDATOR_LIST_CONFIG,
			order: orderOptions.some(
				({ key }) => key === CLEARED_VALIDATOR_LIST_CONFIG.order,
			)
				? CLEARED_VALIDATOR_LIST_CONFIG.order
				: (orderOptions[0]?.key ?? config.order),
		})
	}

	return (
		<ControlsForm onSubmit={handleSubmit}>
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
			{apiFilters && (
				<ApiFilters filters={draft.filters} onChange={changeFilters} />
			)}
			<ConfigRow $apiFilters={apiFilters}>
				{!apiFilters && (
					<FilterGroup>
						<legend>{t('filter')}</legend>
						<FilterButtons>
							<FilterSwitch
								label={t('activeValidators')}
								enabled={!!draft.filters.active}
								onClick={() =>
									changeFilters({
										active: draft.filters.active ? undefined : true,
									})
								}
							/>
							<Exclusions filters={draft.filters} onChange={changeFilters} />
						</FilterButtons>
					</FilterGroup>
				)}
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
								$active={draft.order === key}
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
						disabled={disabled || !hasChanges}
						pulse={hasChanges && !disabled}
						onClick={apply}
					/>
				</Actions>
			</ConfigRow>
		</ControlsForm>
	)
}
