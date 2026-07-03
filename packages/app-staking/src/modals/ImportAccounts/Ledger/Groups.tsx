// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons'
import { faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMenu } from 'contexts/Menu'
import type { MenuItem } from 'contexts/Menu/types'
import { MenuList } from 'library/Menu/List'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonMenu } from 'ui-buttons'
import type { GroupsProps } from './types'
import { ButtonWrapper, GroupWrapper } from './Wrappers'

export const Groups = ({
	activeGroup,
	addressGroups,
	canAddGroup,
	onGroupChange,
	onAddGroup,
}: GroupsProps) => {
	const { t } = useTranslation()
	const { openMenu, open } = useMenu()
	const dropdownButtonRef = useRef<HTMLDivElement>(null)

	const groupMenuItems = useMemo((): MenuItem[] => {
		const items: MenuItem[] = addressGroups.map((group) => {
			return {
				icon: (
					<FontAwesomeIcon
						icon={group === activeGroup ? faCheckCircle : faCircle}
						transform="shrink-3"
					/>
				),
				title: `${t('ledgerDevice', { ns: 'app', group })}`,
				cb: () => onGroupChange(group),
			}
		})
		items.push({
			icon: <FontAwesomeIcon icon={faPlus} transform="shrink-3" />,
			title: t('newDevice', { ns: 'modals' }),
			cb: onAddGroup,
			disabled: !canAddGroup,
		})
		return items
	}, [addressGroups, activeGroup, t, onGroupChange, onAddGroup, canAddGroup])

	const handleOpenGroupMenu = () => {
		if (!open && dropdownButtonRef.current) {
			const rect = dropdownButtonRef.current.getBoundingClientRect()

			// Create a synthetic event with coordinates at the bottom-left corner of the button
			const syntheticEvent = {
				clientX: rect.left,
				clientY: rect.bottom + 3,
			} as ReactMouseEvent<HTMLButtonElement, MouseEvent>

			openMenu(syntheticEvent, <MenuList items={groupMenuItems} secondaryBg />)
		}
	}

	return (
		<GroupWrapper>
			<ButtonWrapper ref={dropdownButtonRef}>
				<ButtonMenu
					text={`${t('ledgerDevice', { ns: 'app', group: activeGroup })}`}
					iconRight={faChevronDown}
					iconTransform="shrink-3"
					onClick={handleOpenGroupMenu}
				/>
			</ButtonWrapper>
		</GroupWrapper>
	)
}
