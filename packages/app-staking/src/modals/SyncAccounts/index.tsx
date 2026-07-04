// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faMobileScreenButton,
	faQrcode,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { Title } from 'library/Modal/Title'
import { fetchAccountsToken } from 'plugin-gateway'
import qrcode from 'qrcode-generator'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from 'ui-buttons'
import { Spinner } from 'ui-core/base'
import { Support } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import {
	ExplainerBox,
	ModeToggle,
	QrContainer,
	QrImage,
	SpinnerOverlay,
} from './Wrapper'

type SyncMode = 'active' | 'all'

export const SyncAccounts = () => {
	const { t } = useTranslation()
	const { setModalResize } = useOverlay().modal
	const { getAccount, accounts } = useImportedAccounts()
	const { activeAccount, activeAddress } = useActiveAccount()

	const [token, setToken] = useState<string | null>(null)
	const [accessCode, setAccessCode] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [mode, setMode] = useState<SyncMode>('active')
	const controllerRef = useRef<AbortController | null>(null)

	const account = getAccount(activeAccount)
	const name = account?.name || ''

	const fetchToken = async (addresses: { address: string; name: string }[]) => {
		controllerRef.current?.abort()
		const controller = new AbortController()
		controllerRef.current = controller

		setToken(null)
		setAccessCode(null)
		setLoading(true)
		setError(null)

		try {
			const data = await fetchAccountsToken(addresses, {
				signal: controller.signal,
			})
			if (!controller.signal.aborted) {
				setToken(data.token)
				setAccessCode(data.accessCode)
			}
		} catch (err) {
			if (!controller.signal.aborted) {
				setError(
					err instanceof Error
						? err.message
						: t('failedToFetchToken', { ns: 'modals' }),
				)
			}
		} finally {
			if (!controller.signal.aborted) {
				setLoading(false)
			}
		}
	}

	const accountsSignature = useMemo(
		() =>
			accounts
				.map(({ address, name: n }) => `${address}:${n}`)
				.sort()
				.join(','),
		[accounts],
	)

	useEffect(() => {
		if (mode === 'active') {
			if (!activeAddress) {
				setLoading(false)
				setError(t('noActiveAccount', { ns: 'modals' }))
				return
			}
			fetchToken([{ address: activeAddress, name }])
		} else {
			if (accounts.length === 0) {
				setLoading(false)
				setError(t('noAccountsAvailable', { ns: 'modals' }))
				return
			}
			fetchToken(accounts.map((a) => ({ address: a.address, name: a.name })))
		}

		return () => {
			controllerRef.current?.abort()
		}
	}, [mode, activeAddress, name, accountsSignature])

	useEffect(() => setModalResize(), [loading, error, token])

	const generateQrDataUrl = (value: string): string => {
		// Restore default string encoding — the shared qrcode module overrides
		// stringToBytes globally to pass through raw Uint8Array bytes for
		// substrate address QR codes. Reset it here so the token is encoded as
		// a UTF-8 text string.
		// biome-ignore lint/suspicious/noExplicitAny: <qr data>
		;(qrcode as any).stringToBytes = (s: string): number[] => [
			...new TextEncoder().encode(s),
		]
		const qr = qrcode(0, 'M')
		qr.addData(value)
		qr.make()
		return qr.createDataURL(6, 0)
	}

	return (
		<>
			<Title title={t('syncAccounts', { ns: 'app' })} icon={faQrcode} />
			<Support>
				<ModeToggle>
					<ButtonPrimary
						text={t('activeAccount', { ns: 'modals' })}
						className={mode === 'active' ? 'active' : ''}
						onClick={() => setMode('active')}
					/>
					<ButtonPrimary
						text={t('allAccounts', { ns: 'modals' })}
						className={mode === 'all' ? 'active' : ''}
						onClick={() => setMode('all')}
					/>
				</ModeToggle>
				<QrContainer>
					{loading && (
						<SpinnerOverlay>
							<Spinner style={{ width: '3rem', height: '3rem' }} />
						</SpinnerOverlay>
					)}
					{loading ? (
						<FontAwesomeIcon
							icon={faQrcode}
							style={{ opacity: 0.1, fontSize: '5rem' }}
						/>
					) : error ? (
						<FontAwesomeIcon
							icon={faQrcode}
							style={{ opacity: 0.4, fontSize: '5rem' }}
						/>
					) : token ? (
						<QrImage
							src={generateQrDataUrl(token)}
							alt={t('scanToSync', { ns: 'modals' })}
						/>
					) : null}
				</QrContainer>
				<h4 style={{ padding: '1rem 0' }}>
					{loading
						? t('generatingQrCode', { ns: 'modals' })
						: error
							? error
							: token
								? t('scanToSync', { ns: 'modals' })
								: null}
				</h4>
				{!loading && !error && accessCode ? (
					<p
						style={{
							display: 'flex',
							alignItems: 'baseline',
							gap: '0.5rem',
							margin: '-0.5rem 0 1rem',
						}}
					>
						<span>{t('accessCode', { ns: 'modals' })}:</span>
						<span
							style={{
								fontWeight: 700,
								letterSpacing: '0.08em',
							}}
						>
							{accessCode}
						</span>
					</p>
				) : null}
				<ExplainerBox>
					<div className="text">
						<h3>Staking Companion App</h3>
						<p>{t('syncAccountsExplainer', { ns: 'modals' })}</p>
						<a
							href="https://polkadot.cloud/app"
							target="_blank"
							rel="noreferrer"
						>
							{t('learnMore', { ns: 'modals' })} &rarr;
						</a>
					</div>
					<div className="icon">
						<FontAwesomeIcon icon={faMobileScreenButton} transform="grow-5" />
					</div>
				</ExplainerBox>
			</Support>
		</>
	)
}
