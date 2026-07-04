// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faGithub } from '@fortawesome/free-brands-svg-icons'
import {
	faBookOpen,
	faCloud,
	faCog,
	faDollarSign,
	faExternalLinkAlt,
	faGlobe,
	faInfo,
	faMoon,
	faPuzzlePiece,
	faQrcode,
	faShare,
	faToggleOff,
	faToggleOn,
	faWifi,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useOutsideAlerter } from '@w3ux/hooks'
import { capitalizeFirstLetter } from '@w3ux/utils'
import DiscordSVG from 'assets/brands/discord.svg?react'
import EnvelopeSVG from 'assets/icons/envelope.svg?react'
import {
	DappOrganisation,
	PlatformDocsURL,
	PlatformGitHubURL,
	PlatformURL,
} from 'consts'
import { getRelayChainData } from 'consts/util/chains'
import { useTheme } from 'contexts/Themes'
import { useBalances } from 'hooks/useBalances'
import { useCurrency } from 'hooks/useCurrency'
import { useNetwork } from 'hooks/useNetwork'
import { useShowHelp } from 'hooks/useShowHelp'
import { useStaking } from 'hooks/useStaking'
import { useUi } from 'hooks/useUi'
import { type Dispatch, type SetStateAction, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MenuItem, MenuItemButton } from 'ui-core/popover'
import { useOverlay } from 'ui-overlay'
import { DefaultButton } from './DefaultButton'

export const MenuPopover = ({
	setOpen,
}: {
	setOpen: Dispatch<SetStateAction<boolean>>
}) => {
	const { network } = useNetwork()
	const { t } = useTranslation()
	const { i18n } = useTranslation()
	const { currency } = useCurrency()
	const { isNominator } = useStaking()
	const { mode, toggleTheme } = useTheme()
	const { openModal } = useOverlay().modal
	const { getPoolMembership } = useBalances()
	const { activeAddress } = useActiveAccount()
	const { showHelp, setShowHelp } = useShowHelp()
	const { advancedMode, setAdvancedMode } = useUi()

	const { name } = getRelayChainData(network)
	const { membership } = getPoolMembership(activeAddress)
	const popoverRef = useRef<HTMLDivElement>(null)

	const notStaking = !isNominator && !membership

	// Close the menu if clicked outside of its container
	useOutsideAlerter(popoverRef, () => {
		setOpen(false)
	}, ['header-settings'])

	return (
		<div ref={popoverRef}>
			<MenuItemButton
				onClick={() => {
					setOpen(false)
					openModal({ key: 'Networks' })
				}}
			>
				<div>
					<FontAwesomeIcon icon={faWifi} transform="shrink-2" />
				</div>
				<div>
					<h3>{t('network', { ns: 'app' })}</h3>
					<div>
						<h4>{capitalizeFirstLetter(name)}</h4>
					</div>
				</div>
			</MenuItemButton>
			<MenuItem>
				<button
					type="button"
					onClick={() => {
						setOpen(false)
						openModal({ key: 'SelectLanguage', size: 'xs' })
					}}
				>
					<div>
						<FontAwesomeIcon icon={faGlobe} transform="shrink-2" />
					</div>
					<div>
						<h3>{t('language', { ns: 'app' })}</h3>
					</div>
					<div>
						<div>
							<h4>{i18n.language.toUpperCase()}</h4>
						</div>
					</div>
				</button>
				<button
					type="button"
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
					</div>
					<div>
						<div>
							<h4>{currency}</h4>
						</div>
					</div>
				</button>
			</MenuItem>
			{network === 'polkadot' && (
				<DefaultButton
					text={t('syncAccounts', { ns: 'app' })}
					iconLeft={faQrcode}
					onClick={() => {
						setOpen(false)
						openModal({ key: 'SyncAccounts', size: 'sm' })
					}}
				/>
			)}
			<MenuItemButton onClick={() => setAdvancedMode(!advancedMode)}>
				<div>
					<FontAwesomeIcon icon={faCog} transform="shrink-2" />
				</div>
				<div>
					<h3>{t('advancedMode', { ns: 'app' })}</h3>
				</div>
				<div>
					<div>
						<FontAwesomeIcon
							icon={advancedMode ? faToggleOn : faToggleOff}
							color={advancedMode ? 'var(--gray-1000)' : 'var(--text-tertiary)'}
							transform="grow-8"
						/>
					</div>
				</div>
			</MenuItemButton>
			<MenuItemButton onClick={() => toggleTheme()}>
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
			<MenuItemButton onClick={() => setShowHelp(!showHelp)}>
				<div>
					<FontAwesomeIcon icon={faInfo} transform="shrink-1" />
				</div>
				<div>
					<h3>{t('helpPrompts', { ns: 'app' })}</h3>
				</div>
				<div>
					<div>
						<FontAwesomeIcon
							icon={showHelp ? faToggleOn : faToggleOff}
							color={showHelp ? 'var(--gray-1000)' : 'var(--text-tertiary)'}
							transform="grow-8"
						/>
					</div>
				</div>
			</MenuItemButton>
			<DefaultButton
				text={t('share', { ns: 'app' })}
				note={notStaking ? t('notStaking', { ns: 'app' }) : undefined}
				disabled={notStaking}
				iconLeft={faShare}
				onClick={() => {
					setOpen(false)
					openModal({ key: 'Invite', size: 'sm' })
				}}
			/>
			{!import.meta.env.PROD && (
				<DefaultButton
					text={t('plugins', { ns: 'modals' })}
					iconLeft={faPuzzlePiece}
					onClick={() => {
						setOpen(false)
						openModal({ key: 'Plugins' })
					}}
				/>
			)}
			<MenuItem>
				<button
					type="button"
					onClick={() => {
						setOpen(false)
						openModal({ key: 'DiscordSupport', size: 'sm' })
					}}
				>
					<div>
						<DiscordSVG width="1em" height="1.1em" />
					</div>
					<div>
						<h3>Discord</h3>
					</div>
				</button>
				<button
					type="button"
					onClick={() => {
						setOpen(false)
						openModal({ key: 'MailSupport', size: 'sm' })
					}}
				>
					<div>
						<EnvelopeSVG width="1em" height="1em" />
					</div>
					<div>
						<h3>{t('email', { ns: 'app' })}</h3>
					</div>
				</button>
			</MenuItem>
			<DefaultButton
				text={t('docs', { ns: 'app' })}
				iconLeft={faBookOpen}
				iconRight={faExternalLinkAlt}
				onClick={() => {
					setOpen(false)
					window.open(`${PlatformDocsURL}/${i18n.language}`, '_blank')
				}}
			/>
			<DefaultButton
				text="GitHub"
				iconLeft={faGithub}
				iconRight={faExternalLinkAlt}
				onClick={() => {
					setOpen(false)
					window.open(PlatformGitHubURL, '_blank')
				}}
			/>
			<DefaultButton
				text={DappOrganisation}
				iconLeft={faCloud}
				iconRight={faExternalLinkAlt}
				accent
				onClick={() => {
					setOpen(false)
					window.open(PlatformURL, '_blank')
				}}
			/>
		</div>
	)
}
