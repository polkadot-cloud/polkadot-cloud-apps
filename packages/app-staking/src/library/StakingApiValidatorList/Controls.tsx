// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ValidatorListFilters,
	ValidatorListOrder,
} from 'plugin-staking-api/types'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary, ButtonSecondary } from 'ui-buttons'
import {
	Actions,
	CheckLabel,
	ConfigRow,
	ControlsForm,
	FilterGroup,
	OrderField,
	SearchField,
} from './styles'

export interface ValidatorListConfig {
	filters: Required<Omit<ValidatorListFilters, 'search'>>
	order: ValidatorListOrder
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
	disabled: boolean
	onApply: (config: ValidatorListConfig) => void
}

export const Controls = ({ disabled, onApply }: ControlsProps) => {
	const { t } = useTranslation('app')
	const [draft, setDraft] = useState<ValidatorListConfig>(
		DEFAULT_VALIDATOR_LIST_CONFIG,
	)

	const setFilter = (
		filter: keyof ValidatorListConfig['filters'],
		checked: boolean,
	) => {
		setDraft((current) => ({
			...current,
			filters: { ...current.filters, [filter]: checked },
		}))
	}

	const apply = () => {
		onApply({ ...draft, search: draft.search.trim() })
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		apply()
	}

	const clear = () => {
		setDraft(CLEARED_VALIDATOR_LIST_CONFIG)
		onApply(CLEARED_VALIDATOR_LIST_CONFIG)
	}

	return (
		<ControlsForm onSubmit={handleSubmit}>
			<SearchField>
				<span>{t('search', { defaultValue: 'Search' })}</span>
				<input
					type="search"
					value={draft.search}
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
					<CheckLabel>
						<input
							type="checkbox"
							checked={draft.filters.activeOnly}
							onChange={({ currentTarget }) =>
								setFilter('activeOnly', currentTarget.checked)
							}
						/>
						{t('activeValidators')}
					</CheckLabel>
					<CheckLabel>
						<input
							type="checkbox"
							checked={draft.filters.excludeBlocked}
							onChange={({ currentTarget }) =>
								setFilter('excludeBlocked', currentTarget.checked)
							}
						/>
						{t('exclude')} {t('blockedNominations')}
					</CheckLabel>
					<CheckLabel>
						<input
							type="checkbox"
							checked={draft.filters.excludeMissingIdentity}
							onChange={({ currentTarget }) =>
								setFilter('excludeMissingIdentity', currentTarget.checked)
							}
						/>
						{t('exclude')} {t('missingIdentity')}
					</CheckLabel>
				</FilterGroup>
				<OrderField>
					{t('order')}
					<select
						value={draft.order}
						onChange={({ currentTarget }) =>
							setDraft((current) => ({
								...current,
								order: currentTarget.value as ValidatorListOrder,
							}))
						}
					>
						<option value="ACTIVITY">{t('activity')}</option>
						<option value="RETAINMENT_HIGH">
							{t('retainmentHighToLow', {
								defaultValue: 'Retainment: high to low',
							})}
						</option>
						<option value="RETAINMENT_LOW">
							{t('retainmentLowToHigh', {
								defaultValue: 'Retainment: low to high',
							})}
						</option>
					</select>
				</OrderField>
				<Actions>
					<ButtonSecondary text={t('clear')} onClick={clear} />
					<ButtonPrimary
						text={t('apply', { defaultValue: 'Apply' })}
						disabled={disabled}
						onClick={apply}
					/>
				</Actions>
			</ConfigRow>
		</ControlsForm>
	)
}
