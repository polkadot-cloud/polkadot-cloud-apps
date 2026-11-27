// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'hooks/useTheme'
import { Popover } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import {
	type BrowserFilters,
	exclusionSwitches,
	getGroupOptions,
} from './filtersConfig'
import {
	ApiFilterRow,
	FilterButton,
	FilterButtons,
	FilterGroup,
	FilterPopover,
	OrderTab,
	OrderTabs,
	SwitchTrack,
} from './styles'

const statusOptions = [
	[true, 'active'],
	[false, 'inactive'],
	[undefined, 'all'],
] as const

interface FilterProps {
	filters: BrowserFilters
	onChange: (changes: Partial<BrowserFilters>) => void
}

const nodeSwitches = [
	{ key: 'active', label: 'activeValidators' } as const,
	...exclusionSwitches,
]

export const FilterSwitches = ({
	filters,
	onChange,
	includeActive = false,
}: FilterProps & { includeActive?: boolean }) => {
	const { t } = useTranslation('app')
	return (
		<FilterGroup>
			<legend>{t(includeActive ? 'filter' : 'exclude')}</legend>
			<FilterButtons>
				{(includeActive ? nodeSwitches : exclusionSwitches).map(
					({ key, label }) => {
						const enabled = !!filters[key]
						// Turning off the node browser's active-only switch restores all statuses.
						const value = key === 'active' && enabled ? undefined : !enabled
						return (
							<FilterButton
								key={key}
								type="button"
								aria-pressed={enabled}
								onClick={() => onChange({ [key]: value })}
							>
								<SwitchTrack aria-hidden />
								{t(label)}
							</FilterButton>
						)
					},
				)}
			</FilterButtons>
		</FilterGroup>
	)
}

const ShowOnly = ({ filters, onChange }: FilterProps) => {
	const { t } = useTranslation('app')
	const { themeElementRef } = useTheme()
	const groups = getGroupOptions(filters)
	const { matchAny = [] } = filters
	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<FilterButton
					type="button"
					disabled={groups.every(({ disabled }) => disabled)}
				>
					{t('showOnly')}
					{matchAny.length > 0 && ` (${matchAny.length})`}
					<FontAwesomeIcon icon={faCaretDown} aria-hidden />
				</FilterButton>
			</Popover.Trigger>
			<Popover.Portal container={themeElementRef.current}>
				<FilterPopover
					align="start"
					sideOffset={4}
					collisionPadding={12}
					aria-label={t('showOnly')}
				>
					{groups.map(({ group, label, disabled }) => (
						<label key={group}>
							<input
								type="checkbox"
								disabled={disabled}
								checked={matchAny.includes(group)}
								onChange={({ currentTarget: { checked } }) =>
									onChange({
										matchAny: checked
											? [...matchAny, group]
											: matchAny.filter((item) => item !== group),
									})
								}
							/>
							{t(label)}
						</label>
					))}
				</FilterPopover>
			</Popover.Portal>
		</Popover.Root>
	)
}

export const ApiFilters = (props: FilterProps) => {
	const { t } = useTranslation('app')
	return (
		<ApiFilterRow>
			<FilterGroup>
				<legend>{t('status')}</legend>
				<OrderTabs role="group" aria-label={t('status')}>
					{statusOptions.map(([active, label]) => (
						<OrderTab
							key={label}
							type="button"
							aria-pressed={props.filters.active === active}
							onClick={() => props.onChange({ active })}
						>
							{t(label)}
						</OrderTab>
					))}
				</OrderTabs>
			</FilterGroup>
			<FilterSwitches {...props} />
			<ShowOnly {...props} />
		</ApiFilterRow>
	)
}
