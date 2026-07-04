import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useOutsideAlerter } from '@w3ux/hooks'
import { ellipsisFn } from '@w3ux/utils'
import { AssetHubPolkadotSubscanURL } from 'consts'
import { type Dispatch, type SetStateAction, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PopoverTab } from 'ui-buttons'
import { ConnectItem, MenuItemButton } from 'ui-core/popover'
import { useOverlay } from 'ui-overlay'
import { Account } from './Account'
import classes from './index.module.scss'

export const AccountPopover = ({
	setOpen,
}: {
	setOpen: Dispatch<SetStateAction<boolean>>
}) => {
	const { t } = useTranslation()
	const { openModal } = useOverlay().modal
	const { getAccount } = useImportedAccounts()
	const { activeAccount, activeAddress, setActiveAccount } = useActiveAccount()
	const popoverRef = useRef<HTMLDivElement>(null)

	useOutsideAlerter(popoverRef, () => {
		setOpen(false)
	}, ['header-account'])

	const account = getAccount(activeAccount)
	const name = account?.name || ''
	const accountLabel =
		activeAddress && activeAddress !== ''
			? name || ellipsisFn(activeAddress)
			: ''

	return (
		<div ref={popoverRef} className={classes.popover}>
			<Account address={activeAddress || ''} label={accountLabel} />

			<ConnectItem.Container>
				<h4>Account Details</h4>
			</ConnectItem.Container>
			<MenuItemButton
				style={{ border: 'none' }}
				disabled={!activeAddress}
				onClick={() => {
					setOpen(false)
					window.open(
						`${AssetHubPolkadotSubscanURL}/account/${activeAddress}`,
						'_blank',
					)
				}}
			>
				<div>
					<FontAwesomeIcon icon={faExternalLinkAlt} transform="shrink-2" />
				</div>
				<div>
					<h3>Subscan</h3>
					<div>
						<FontAwesomeIcon icon={faExternalLinkAlt} transform="shrink-3" />
					</div>
				</div>
			</MenuItemButton>

			<PopoverTab.Container position="bottom">
				<PopoverTab.Button
					text={t('switchAccount', { ns: 'app' })}
					onClick={() => {
						setOpen(false)
						openModal({ key: 'Accounts' })
					}}
				/>
				<PopoverTab.Button
					status="danger"
					text={t('disconnect', { ns: 'modals' })}
					onClick={() => {
						setActiveAccount(null)
						setOpen(false)
					}}
				/>
			</PopoverTab.Container>
		</div>
	)
}
