// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons'
import {
	faCloud,
	faDollarSign,
	faEnvelope,
	faExternalLinkAlt,
	faMoon,
	faToggleOff,
	faToggleOn,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useOutsideAlerter } from '@w3ux/hooks'
import {
	DappOrganisation,
	DiscordSupportURL,
	PlatformGitHubURL,
	PlatformSupportEmail,
	PlatformURL,
} from 'consts'
import { useCurrency } from 'contexts/Currency'
import { useTheme } from 'hooks'
import { type Dispatch, type SetStateAction, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MenuItem, MenuItemButton } from 'ui-core/popover'
import { useOverlay } from 'ui-overlay'

export const MenuPopover = ({
	setOpen,
}: {
	setOpen: Dispatch<SetStateAction<boolean>>
}) => {
	const { t } = useTranslation()
	const { currency } = useCurrency()
	const { mode, toggleTheme } = useTheme()
	const { openModal } = useOverlay().modal
	const popoverRef = useRef<HTMLDivElement>(null)

	useOutsideAlerter(popoverRef, () => {
		setOpen(false)
	}, ['header-settings'])

	return (
		<div ref={popoverRef}>
			<MenuItemButton
				onClick={() => {
					setOpen(false)
					openModal({ key: 'SelectCurrency', size: 'xs' })
				}}
			>
				<div>
					<FontAwesomeIcon icon={faDollarSign} transform="shrink-2" />
				</div>
				<div>
					<h3>{t('currency', { ns: 'app' })}</h3>
					<div>
						<h4>{currency}</h4>
					</div>
				</div>
			</MenuItemButton>
			<MenuItemButton
				onClick={() => {
					toggleTheme()
				}}
			>
				<div>
					<FontAwesomeIcon icon={faMoon} transform="shrink-2" />
				</div>
				<div>
					<h3>{t('darkMode', { ns: 'app' })}</h3>
				</div>
				<div>
					<div>
						<FontAwesomeIcon
							icon={mode === 'dark' ? faToggleOn : faToggleOff}
							color={
								mode === 'dark' ? 'var(--gray-1000)' : 'var(--text-tertiary)'
							}
							transform="grow-8"
						/>
					</div>
				</div>
			</MenuItemButton>
			<MenuItem>
				<button
					type="button"
					onClick={() => {
						setOpen(false)
						window.open(DiscordSupportURL, '_blank')
					}}
				>
					<div>
						<FontAwesomeIcon icon={faDiscord} transform="shrink-2" />
					</div>
					<div>
						<h3>Discord</h3>
					</div>
				</button>
				<button
					type="button"
					onClick={() => {
						setOpen(false)
						window.open(`mailto:${PlatformSupportEmail}`, '_blank')
					}}
				>
					<div>
						<FontAwesomeIcon icon={faEnvelope} transform="shrink-2" />
					</div>
					<div>
						<h3>Email</h3>
					</div>
				</button>
			</MenuItem>
			<MenuItemButton
				onClick={() => {
					setOpen(false)
					window.open(PlatformGitHubURL, '_blank')
				}}
			>
				<div>
					<FontAwesomeIcon icon={faGithub} transform="shrink-2" />
				</div>
				<div>
					<h3>GitHub</h3>
				</div>
				<div>
					<div>
						<FontAwesomeIcon icon={faExternalLinkAlt} transform="shrink-3" />
					</div>
				</div>
			</MenuItemButton>
			<MenuItemButton
				onClick={() => {
					setOpen(false)
					window.open(PlatformURL, '_blank')
				}}
			>
				<div>
					<FontAwesomeIcon icon={faCloud} transform="shrink-2" />
				</div>
				<div>
					<h3>{DappOrganisation}</h3>
				</div>
				<div>
					<div>
						<FontAwesomeIcon icon={faExternalLinkAlt} transform="shrink-3" />
					</div>
				</div>
			</MenuItemButton>
		</div>
	)
}
