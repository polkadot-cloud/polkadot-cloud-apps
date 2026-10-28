// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { OperatorListOrder } from 'plugin-staking-api/types'
import type { SubmitEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSecondary, ButtonSubmit } from 'ui-buttons'
import {
	Actions,
	ConfigRow,
	ControlsForm,
	OrderField,
	OrderTab,
	OrderTabs,
	SearchField,
} from './styles'

export interface OperatorListConfig {
	order: OperatorListOrder
	search: string
}

export const DEFAULT_OPERATOR_LIST_CONFIG: OperatorListConfig = {
	order: 'RETAINMENT_HIGH',
	search: '',
}

interface ControlsProps {
	config: OperatorListConfig
	disabled: boolean
	onApply: (config: OperatorListConfig) => void
}

export const Controls = ({ config, disabled, onApply }: ControlsProps) => {
	const { t } = useTranslation('app')
	const [draft, setDraft] = useState(config)
	const options: Array<{ key: OperatorListOrder; label: string }> = [
		{ key: 'RETAINMENT_HIGH', label: t('highRetainment') },
		{ key: 'RETAINMENT_LOW', label: t('lowRetainment') },
		{ key: 'VALIDATOR_COUNT', label: t('validatorCount') },
		{
			key: 'AVERAGE_SELF_STAKE_HIGH',
			label: t('averageSelfStakeHigh'),
		},
		{
			key: 'AVERAGE_SELF_STAKE_LOW',
			label: t('averageSelfStakeLow'),
		},
	]
	const nextConfig = { ...draft, search: draft.search.trim() }
	const hasChanges =
		nextConfig.order !== config.order || nextConfig.search !== config.search

	const apply = () => {
		if (!disabled && hasChanges) {
			onApply(nextConfig)
		}
	}

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()
		apply()
	}

	return (
		<ControlsForm onSubmit={handleSubmit}>
			<SearchField>
				<input
					type="search"
					value={draft.search}
					aria-label={t('searchOperators')}
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
				<OrderField disabled={disabled}>
					<legend>{t('order')}</legend>
					<OrderTabs role="tablist" aria-label={t('order')}>
						{options.map(({ key, label }) => (
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
					<ButtonSecondary
						text={t('clear')}
						onClick={() => setDraft(DEFAULT_OPERATOR_LIST_CONFIG)}
					/>
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
