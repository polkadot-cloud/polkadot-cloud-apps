// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChartLine,
	faChevronDown,
	faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMenu } from 'hooks/useMenu'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MenuList } from 'ui-app/Menu'
import { ValidatorMenuTrigger, ValidatorMenuWrapper } from './Wrappers'

export const ValidatorMenu = () => {
	const { t } = useTranslation('app')
	const { open, openMenu } = useMenu()
	const [ownsOpenMenu, setOwnsOpenMenu] = useState(false)
	const menuItems = [
		{
			icon: <FontAwesomeIcon icon={faChartLine} transform="shrink-3" />,
			title: t('metrics'),
			cb: () => undefined,
		},
		{
			icon: <FontAwesomeIcon icon={faUsers} transform="shrink-3" />,
			title: t('identityGraph', { defaultValue: 'Identity Graph' }),
			cb: () => undefined,
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
		<ValidatorMenuWrapper>
			<ValidatorMenuTrigger
				type="button"
				aria-label={t('validatorActions', {
					defaultValue: 'Validator actions',
				})}
				aria-haspopup="menu"
				aria-expanded={open && ownsOpenMenu}
				onClick={toggleMenu}
			>
				<FontAwesomeIcon icon={faChevronDown} aria-hidden="true" />
			</ValidatorMenuTrigger>
		</ValidatorMenuWrapper>
	)
}
