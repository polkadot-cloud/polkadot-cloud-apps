// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSecondary, ButtonSubmit } from 'ui-buttons'
import {
	Actions,
	ConfigRow,
	ControlsForm,
	FilterButton,
	FilterButtons,
	FilterGroup,
	OrderField,
	OrderTab,
	OrderTabs,
	SearchField,
	SwitchTrack,
} from './styles'

export interface ValidatorListConfig {
	filters: {
		activeOnly: boolean
		excludeBlocked: boolean
		excludeMissingIdentity: boolean
	}
	order: string
	search: string
}

export const DEFAULT_VALIDATOR_LIST_CONFIG: ValidatorListConfig = {
	filters: {
		activeOnly: false,
		excludeBlocked: true,
		excludeMissingIdentity: true,
	},
	order: 'ACTIVITY',
	search: '',
}

const CLEARED_VALIDATOR_LIST_CONFIG: ValidatorListConfig = {
	filters: {
		activeOnly: false,
		excludeBlocked: false,
		excludeMissingIdentity: false,
	},
	order: 'ACTIVITY',
	search: '',
}

interface ControlsProps {
	config: ValidatorListConfig
	disabled: boolean
	onApply: (config: ValidatorListConfig) => void
	orderOptions?: Array<{ key: string; label: string }>
}

export const Controls = ({
	config,
	disabled,
	onApply,
	orderOptions: suppliedOrderOptions,
}: ControlsProps) => {
	const { t } = useTranslation('app')
	const [draft, setDraft] = useState(config)

	const setFilter = (filter: keyof ValidatorListConfig['filters']) => {
		setDraft((current) => ({
			...current,
			filters: {
				...current.filters,
				[filter]: !current.filters[filter],
			},
		}))
	}
	const filterOptions: Array<{
		key: keyof ValidatorListConfig['filters']
		label: string
	}> = [
		{
			key: 'activeOnly',
			label: t('activeValidators'),
		},
		{
			key: 'excludeBlocked',
			label: t('blockedNominations'),
		},
		{
			key: 'excludeMissingIdentity',
			label: t('missingIdentity'),
		},
	]
	const defaultOrderOptions = [
		{ key: 'ACTIVITY', label: t('activity') },
		{
			key: 'RETAINMENT_HIGH',
			label: t('highRetainment', {
				defaultValue: 'High Retainment',
			}),
		},
		{
			key: 'RETAINMENT_LOW',
			label: t('lowRetainment', {
				defaultValue: 'Low Retainment',
			}),
		},
	]
	const orderOptions = suppliedOrderOptions ?? defaultOrderOptions
	const nextConfig = { ...draft, search: draft.search.trim() }
	const hasChanges =
		nextConfig.search !== config.search ||
		nextConfig.order !== config.order ||
		nextConfig.filters.activeOnly !== config.filters.activeOnly ||
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
		setDraft(CLEARED_VALIDATOR_LIST_CONFIG)
	}

	return (
		<ControlsForm onSubmit={handleSubmit}>
			<SearchField>
				<input
					type="search"
					value={draft.search}
					aria-label={t('validatorSearch.searchValidators')}
					placeholder={t('searchAddress')}
					onChange={({ currentTarget }) =>
						setDraft((current) => ({
							...current,
							search: currentTarget.value,
						}))
					}
				/>
			</SearchField>
			<ConfigRow>
				<FilterGroup>
					<legend>{t('filter')}</legend>
					<FilterButtons>
						{filterOptions.map(({ key, label }) => (
							<FilterButton
								key={key}
								type="button"
								aria-pressed={draft.filters[key]}
								onClick={() => setFilter(key)}
							>
								<SwitchTrack $active={draft.filters[key]} aria-hidden="true" />
								<span>{label}</span>
							</FilterButton>
						))}
					</FilterButtons>
				</FilterGroup>
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
						text={t('apply', { defaultValue: 'Apply' })}
						disabled={disabled || !hasChanges}
						pulse={hasChanges && !disabled}
						onClick={apply}
					/>
				</Actions>
			</ConfigRow>
		</ControlsForm>
	)
}
