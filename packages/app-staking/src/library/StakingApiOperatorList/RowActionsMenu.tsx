// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronDown,
	faCopy,
	faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { emitNotification } from 'global-bus'
import { type MenuItem, useMenu } from 'hooks/useMenu'
import type { OperatorListItem } from 'plugin-staking-api/types'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ListItem } from 'ui-app/ListItem'
import { MenuList } from 'ui-app/Menu'
import { useOpenOperatorValidators } from './useOpenOperatorValidators'

export const RowActionsMenu = ({
	operator,
}: {
	operator: OperatorListItem
}) => {
	const { t } = useTranslation('app')
	const { open, openMenu } = useMenu()
	const [ownsOpenMenu, setOwnsOpenMenu] = useState(false)
	const openOperatorValidators = useOpenOperatorValidators(operator)
	const { address } = operator.identity

	const copyAddress = async () => {
		try {
			await navigator.clipboard.writeText(address)
			emitNotification({ title: t('copied'), subtitle: address })
		} catch {
			emitNotification({ title: t('copyFailed'), subtitle: address })
		}
	}

	const menuItems: MenuItem[] = [
		{
			icon: <FontAwesomeIcon icon={faCopy} transform="shrink-3" />,
			title: t('copyAddress'),
			cb: () => void copyAddress(),
		},
		{
			icon: <FontAwesomeIcon icon={faUsers} transform="shrink-3" />,
			title: t('validators'),
			cb: openOperatorValidators,
		},
	]

	const toggleMenu = (event: ReactMouseEvent<HTMLButtonElement>) => {
		if (!open) {
			setOwnsOpenMenu(true)
			openMenu(event, <MenuList items={menuItems} secondaryBg />)
		}
	}

	useEffect(() => {
		if (!open) {
			setOwnsOpenMenu(false)
		}
	}, [open])

	return (
		<ListItem.Actions>
			<ListItem.MenuTrigger
				type="button"
				aria-label={t('otherOptions')}
				aria-haspopup="menu"
				aria-expanded={open && ownsOpenMenu}
				onClick={toggleMenu}
			>
				<FontAwesomeIcon icon={faChevronDown} aria-hidden="true" />
			</ListItem.MenuTrigger>
		</ListItem.Actions>
	)
}
