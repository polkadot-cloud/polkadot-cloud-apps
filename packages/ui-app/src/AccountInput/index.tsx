// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useImportedAccounts } from '@polkadot-cloud/connect'
import { Polkicon } from '@w3ux/react-polkicon'
import { formatAccountSs58, isValidAddress } from '@w3ux/util-dedot'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSecondary } from 'ui-buttons'
import { AccountInput as AccountInputCore } from 'ui-core/input'
import { useOverlay } from 'ui-overlay'
import type { AccountInputProps } from './types'

export type { AccountInputProps } from './types'

export const AccountInput = ({
	successCallback,
	resetCallback,
	defaultLabel,
	resetOnSuccess = false,
	successLabel,
	locked = false,
	inactive = false,
	disallowAlreadyImported = true,
	initialValue = null,
	border = true,
}: AccountInputProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { accounts } = useImportedAccounts()
	const { setModalResize } = useOverlay().modal
	const { ss58 } = getStakingChainData(network)

	const [value, setValue] = useState<string>(initialValue || '')
	const [valid, setValid] = useState<string | null>(null)
	const [reformatted, setReformatted] = useState<boolean>(false)
	const [submitting, setSubmitting] = useState<boolean>(false)
	const [successLock, setSuccessLocked] = useState<boolean>(locked)

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.currentTarget.value.trim()
		setValue(newValue)

		if (reformatted) {
			setReformatted(false)
		}

		if (newValue === '') {
			setValid(null)
			return
		}

		const alreadyImported = accounts.find(
			(a) => a.address.toUpperCase() === newValue.toUpperCase(),
		)
		if (alreadyImported !== undefined && disallowAlreadyImported) {
			setValid('already_imported')
			return
		}

		setValid(isValidAddress(newValue) ? 'valid' : 'not_valid')
	}

	const handleImport = async () => {
		const addressFormatted = formatAccountSs58(value, ss58)

		if (!addressFormatted) {
			setValid('not_valid')
			return
		}

		if (addressFormatted !== value) {
			setValid('confirm_reformat')
			setValue(addressFormatted)
			setReformatted(true)
		} else {
			setSubmitting(true)
			const result = await successCallback(value)
			setSubmitting(false)

			if (result && resetOnSuccess) {
				resetInput()
			} else {
				setSuccessLocked(true)
			}
		}
	}

	useEffect(() => {
		setValue(initialValue || '')
	}, [initialValue])

	let label
	let labelStatus: 'neutral' | 'danger' | 'success'
	const showSuccess = successLock && successLabel

	switch (valid) {
		case 'confirm_reformat':
			label = t('confirmReformat')
			labelStatus = 'neutral'
			break
		case 'already_imported':
			label = t('alreadyImported')
			labelStatus = 'danger'
			break
		case 'not_valid':
			label = t('invalid')
			labelStatus = 'danger'
			break
		case 'valid':
			label = showSuccess ? successLabel : t('valid')
			labelStatus = showSuccess ? 'neutral' : 'success'
			break
		default:
			label = showSuccess ? successLabel : defaultLabel
			labelStatus = 'neutral'
			break
	}

	const handleConfirm = () => {
		setValid('valid')
		setReformatted(false)
		handleImport()
	}

	const resetInput = () => {
		setReformatted(false)
		setValue('')
		setValid(null)
		setModalResize()
		setSuccessLocked(false)
		resetCallback?.()
	}

	return (
		<AccountInputCore.ImportWrapper inactive={inactive} border={border}>
			{inactive && <AccountInputCore.ImportInactiveBlock />}
			<AccountInputCore.ImportLabel status={labelStatus}>
				{successLock && (
					<>
						<FontAwesomeIcon icon={faCheck} />
						&nbsp;
					</>
				)}{' '}
				{label}
			</AccountInputCore.ImportLabel>
			<AccountInputCore.ImportContainer disabled={successLock}>
				<AccountInputCore.ImportSection>
					<AccountInputCore.ImportIconSlot>
						{isValidAddress(value) ? (
							<span style={{ padding: '0 0.5rem' }}>
								<Polkicon address={value} transform="grow-10" />
							</span>
						) : (
							<AccountInputCore.ImportIdenticonPlaceholder />
						)}
					</AccountInputCore.ImportIconSlot>
					<AccountInputCore.ImportFieldSlot>
						<AccountInputCore.ImportTextInput
							placeholder={t('address')}
							type="text"
							onChange={handleChange}
							value={value}
							disabled={successLock}
						/>
					</AccountInputCore.ImportFieldSlot>
				</AccountInputCore.ImportSection>
				<AccountInputCore.ImportSection>
					{successLock ? (
						<ButtonSecondary onClick={() => resetInput()} text={t('reset')} />
					) : !reformatted ? (
						<ButtonSecondary
							onClick={() => handleImport()}
							text={submitting ? t('importing') : t('import')}
							disabled={valid !== 'valid' || submitting}
						/>
					) : (
						<ButtonSecondary
							onClick={() => handleConfirm()}
							text={t('confirm')}
						/>
					)}
				</AccountInputCore.ImportSection>
			</AccountInputCore.ImportContainer>
		</AccountInputCore.ImportWrapper>
	)
}
