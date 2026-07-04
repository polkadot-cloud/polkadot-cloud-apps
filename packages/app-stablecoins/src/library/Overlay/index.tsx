// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	useActiveAccount,
	useExternalAccounts,
	useImportedAccounts,
} from '@polkadot-cloud/connect'
import { useLedger, useLedgerAccounts } from '@polkadot-cloud/connect-ledger'
import {
	QrScanSignature,
	useVaultAccounts,
} from '@polkadot-cloud/connect-vault'
import { formatAccountSs58, isValidAddress } from '@w3ux/util-dedot'
import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

type ModalKey = 'Accounts' | 'ExternalAccounts' | 'ImportAccounts' | 'Transfer'
type ModalState = {
	key: ModalKey
	options?: Record<string, unknown>
} | null

const Network = 'polkadot'
const Ss58 = 0

const OverlayContext = createContext<{
	canvas: {
		openCanvas: () => void
	}
	modal: {
		closeModal: () => void
		openModal: (modal: {
			key: ModalKey
			options?: Record<string, unknown>
			size?: string
		}) => void
		setModalResize: () => void
	}
} | null>(null)

export const useOverlay = () => {
	const context = useContext(OverlayContext)
	if (!context) {
		throw new Error('useOverlay must be used within OverlayProvider')
	}
	return context
}

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
	const [modal, setModal] = useState<ModalState>(null)
	const closeModal = () => setModal(null)

	const value = useMemo(
		() => ({
			canvas: {
				openCanvas: () => {},
			},
			modal: {
				closeModal,
				openModal: ({ key, options }: NonNullable<ModalState>) =>
					setModal({ key, options }),
				setModalResize: () => {},
			},
		}),
		[],
	)

	return (
		<OverlayContext.Provider value={value}>
			{children}
			{modal && <ModalRouter modal={modal} onClose={closeModal} />}
		</OverlayContext.Provider>
	)
}

const ModalShell = ({
	title,
	children,
	onClose,
}: {
	title: string
	children: ReactNode
	onClose: () => void
}) => (
	<div className="stablecoinsModalBackdrop">
		<button
			type="button"
			aria-label={`Close ${title}`}
			className="stablecoinsModalUnderlay"
			onClick={onClose}
		/>
		<div className="stablecoinsModal">
			<header>
				<h2>{title}</h2>
				<button type="button" onClick={onClose}>
					Close
				</button>
			</header>
			{children}
		</div>
	</div>
)

const ModalRouter = ({
	modal,
	onClose,
}: {
	modal: NonNullable<ModalState>
	onClose: () => void
}) => {
	switch (modal.key) {
		case 'Accounts':
			return <AccountsModal onClose={onClose} />
		case 'ExternalAccounts':
			return <ReadOnlyModal onClose={onClose} />
		case 'ImportAccounts':
			return modal.options?.source === 'ledger' ? (
				<LedgerModal onClose={onClose} />
			) : (
				<VaultModal onClose={onClose} />
			)
		case 'Transfer':
			return <TransferModal onClose={onClose} />
	}
}

const AccountsModal = ({ onClose }: { onClose: () => void }) => {
	const { activeAccount, setActiveAccount } = useActiveAccount()
	const { accounts, accountHasSigner } = useImportedAccounts()

	return (
		<ModalShell title="Accounts" onClose={onClose}>
			<div className="stablecoinsAccountList">
				{accounts.length === 0 ? (
					<p>No imported accounts.</p>
				) : (
					accounts.map((account) => {
						const active =
							activeAccount?.address === account.address &&
							activeAccount?.source === account.source

						return (
							<button
								type="button"
								key={`${account.source}-${account.address}`}
								className={active ? 'active' : undefined}
								onClick={() => {
									setActiveAccount({
										address: account.address,
										source: account.source,
									})
									onClose()
								}}
							>
								<strong>{account.name || account.address}</strong>
								<small>{account.address}</small>
								<em>
									{accountHasSigner({
										address: account.address,
										source: account.source,
									})
										? account.source
										: 'read-only'}
								</em>
							</button>
						)
					})
				)}
			</div>
		</ModalShell>
	)
}

const ReadOnlyModal = ({ onClose }: { onClose: () => void }) => {
	const { addReadOnlyAccount } = useExternalAccounts()
	const { setActiveAccount } = useActiveAccount()
	const [address, setAddress] = useState('')
	const [error, setError] = useState('')

	return (
		<ModalShell title="Read Only Account" onClose={onClose}>
			<label>
				<span>Polkadot Address</span>
				<input
					value={address}
					onChange={(event) => setAddress(event.target.value)}
				/>
			</label>
			{error && <p className="error">{error}</p>}
			<button
				type="button"
				className="stablecoinsPrimary"
				onClick={() => {
					const result = addReadOnlyAccount(address)
					if (!result) {
						setError('Enter a valid Polkadot address.')
						return
					}
					setActiveAccount({
						address: result.account.address,
						source: result.account.source,
					})
					onClose()
				}}
			>
				Import Account
			</button>
		</ModalShell>
	)
}

const VaultModal = ({ onClose }: { onClose: () => void }) => {
	const { addVaultAccount, getVaultAccounts, vaultAccountExists } =
		useVaultAccounts(Network)
	const { setActiveAccount } = useActiveAccount()
	const accounts = getVaultAccounts()
	const [feedback, setFeedback] = useState('Scan a Polkadot Vault account QR.')

	const importAddress = (raw: string) => {
		const address = formatAccountSs58(raw.trim(), Ss58)
		if (!address || !isValidAddress(address)) {
			setFeedback('Invalid Polkadot address.')
			return
		}
		if (vaultAccountExists(address)) {
			setFeedback('This account is already imported.')
			return
		}
		const account = addVaultAccount(1, address, accounts.length)
		if (account) {
			setActiveAccount({ address: account.address, source: account.source })
			onClose()
		}
	}

	return (
		<ModalShell title="Polkadot Vault" onClose={onClose}>
			<div className="stablecoinsQr">
				<QrScanSignature
					size={250}
					onScan={({ signature }) =>
						importAddress(signature.split(':')?.[1] || signature)
					}
					onError={() => undefined}
				/>
			</div>
			<p>{feedback}</p>
		</ModalShell>
	)
}

const LedgerModal = ({ onClose }: { onClose: () => void }) => {
	const { addLedgerAccount, getLedgerAccounts, ledgerAccountExists } =
		useLedgerAccounts(Network)
	const { fetchLedgerAddress, isExecuting } = useLedger()
	const { setActiveAccount } = useActiveAccount()
	const accounts = getLedgerAccounts()
	const [index, setIndex] = useState(0)
	const [message, setMessage] = useState(
		'Connect Ledger and open the Polkadot app.',
	)

	return (
		<ModalShell title="Ledger" onClose={onClose}>
			<p>{message}</p>
			<label>
				<span>Account Index</span>
				<input
					type="number"
					min="0"
					value={index}
					onChange={(event) => setIndex(Number(event.target.value))}
				/>
			</label>
			<button
				type="button"
				className="stablecoinsPrimary"
				disabled={isExecuting}
				onClick={async () => {
					setMessage('Waiting for Ledger...')
					const response = await fetchLedgerAddress(index, Ss58)
					if (!response?.address) {
						setMessage('Unable to fetch an address from Ledger.')
						return
					}
					if (ledgerAccountExists(response.address)) {
						setMessage('This account is already imported.')
						return
					}
					const account = addLedgerAccount(1, response.address, accounts.length)
					if (account) {
						setActiveAccount({
							address: account.address,
							source: account.source,
						})
						onClose()
					}
				}}
			>
				{isExecuting ? 'Connecting...' : 'Import Ledger Account'}
			</button>
		</ModalShell>
	)
}

const TransferModal = ({ onClose }: { onClose: () => void }) => {
	const navigate = useNavigate()

	return (
		<ModalShell title="Send" onClose={onClose}>
			<p>Stablecoin transfers use the Send page.</p>
			<button
				type="button"
				className="stablecoinsPrimary"
				onClick={() => {
					navigate('/send')
					onClose()
				}}
			>
				Open Send
			</button>
		</ModalShell>
	)
}
