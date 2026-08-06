// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import {
	faChartLine,
	faChevronDown,
	faCopy,
	faHeart,
	faLink,
	faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StakingProductionURL } from 'consts'
import { emitNotification } from 'global-bus'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { type MenuItem, useMenu } from 'hooks/useMenu'
import { Confirm } from 'library/Prompt/Confirm'
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ListItem } from 'ui-app/ListItem'
import { MenuList } from 'ui-app/Menu'
import { useOverlay, usePrompt } from 'ui-overlay'

interface RowActionsMenuProps {
	address: string
	display: ReactNode | null
	onRemove?: () => void
	showFavorite: boolean
	showMetrics: boolean
}

export const RowActionsMenu = ({
	address,
	display,
	onRemove,
	showFavorite,
	showMetrics,
}: RowActionsMenuProps) => {
	const { t } = useTranslation('app')
	const { open, openMenu } = useMenu()
	const { favorites, addFavorite, removeFavorite } = useFavoriteValidators()
	const { openCanvas } = useOverlay().canvas
	const { openPromptWith, closePrompt } = usePrompt()
	const [ownsOpenMenu, setOwnsOpenMenu] = useState(false)
	const isFavorite = favorites.includes(address)

	const copyToClipboard = async (value: string, successTitle: string) => {
		try {
			await navigator.clipboard.writeText(value)
			emitNotification({ title: successTitle, subtitle: value })
		} catch {
			emitNotification({ title: t('copyFailed'), subtitle: value })
		}
	}

	const shareUrl = `${StakingProductionURL}/#/overview?v=${address}`
	const menuItems: MenuItem[] = [
		{
			icon: <FontAwesomeIcon icon={faCopy} transform="shrink-3" />,
			title: t('copyAddress'),
			cb: () => void copyToClipboard(address, t('copied')),
		},
		{
			icon: <FontAwesomeIcon icon={faLink} transform="shrink-3" />,
			title: t('copyShareLink'),
			cb: () => void copyToClipboard(shareUrl, t('linkCopied')),
		},
	]

	if (showFavorite) {
		menuItems.push({
			icon: (
				<FontAwesomeIcon
					icon={isFavorite ? faHeart : faHeartRegular}
					transform="shrink-3"
				/>
			),
			title: `${t(isFavorite ? 'remove' : 'add')} ${t('favorite')}`,
			cb: () => {
				if (isFavorite) {
					removeFavorite(address)
				} else {
					addFavorite(address)
				}
				emitNotification({
					title: t(
						isFavorite ? 'favoriteValidatorRemoved' : 'favoriteValidatorAdded',
					),
					subtitle: address,
				})
			},
		})
	}

	if (onRemove) {
		const controlKey = `selected_${address}`
		menuItems.push({
			icon: <FontAwesomeIcon icon={faXmark} transform="shrink-3" />,
			title: t('remove'),
			cb: () => {
				openPromptWith(
					<Confirm
						text={t('removeFromNominees')}
						controlKey={controlKey}
						onClose={closePrompt}
						onRevert={() => {
							onRemove()
							closePrompt()
						}}
					/>,
					'sm',
				)
			},
		})
	}

	if (showMetrics) {
		menuItems.push({
			icon: <FontAwesomeIcon icon={faChartLine} transform="shrink-3" />,
			title: t('metrics'),
			cb: () =>
				openCanvas({
					key: 'ValidatorMetrics',
					options: {
						validator: address,
						identity: display,
					},
					size: 'xl',
				}),
		})
	}

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
