// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'hooks/useTheme'
import { Popover } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { type BrowserFilters, getGroupOptions } from './filtersConfig'
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

export const FilterSwitch = ({
	label,
	enabled,
	onClick,
}: {
	label: string
	enabled: boolean
	onClick: () => void
}) => (
	<FilterButton type="button" aria-pressed={enabled} onClick={onClick}>
		<SwitchTrack $active={enabled} aria-hidden />
		{label}
	</FilterButton>
)

export const Exclusions = ({ filters, onChange }: FilterProps) => {
	const { t } = useTranslation('app')
	return (
		<>
			<FilterSwitch
				label={t('blockedNominations')}
				enabled={filters.excludeBlocked}
				onClick={() => onChange({ excludeBlocked: !filters.excludeBlocked })}
			/>
			<FilterSwitch
				label={t('missingIdentity')}
				enabled={filters.excludeMissingIdentity}
				onClick={() =>
					onChange({ excludeMissingIdentity: !filters.excludeMissingIdentity })
				}
			/>
		</>
	)
}

export const ApiFilters = ({ filters, onChange }: FilterProps) => {
	const { t } = useTranslation('app')
	const { themeElementRef } = useTheme()
	const groups = getGroupOptions(filters)
	const { matchAny = [] } = filters
	return (
		<ApiFilterRow>
			<FilterGroup>
				<legend>{t('status')}</legend>
				<OrderTabs role="group" aria-label={t('status')}>
					{statusOptions.map(([active, label]) => (
						<OrderTab
							key={label}
							type="button"
							$active={filters.active === active}
							aria-pressed={filters.active === active}
							onClick={() => onChange({ active })}
						>
							{t(label)}
						</OrderTab>
					))}
				</OrderTabs>
			</FilterGroup>
			<FilterGroup>
				<legend>{t('exclude')}</legend>
				<FilterButtons>
					<Exclusions filters={filters} onChange={onChange} />
				</FilterButtons>
			</FilterGroup>
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
		</ApiFilterRow>
	)
}
