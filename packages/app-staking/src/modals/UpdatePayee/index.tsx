// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { isValidAddress } from '@w3ux/util-dedot'
import type { PayeeConfig, PayeeOption } from 'contexts/NominatorSetups/types'
import { AccountId32 } from 'dedot/codecs'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { usePayeeConfig } from 'hooks/usePayeeConfig'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { Warning } from 'library/Form/Warning'
import { PayeeInput } from 'library/PayeeInput'
import { SelectItems } from 'library/SelectItems'
import { SelectItem } from 'library/SelectItems/Item'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MaybeAddress } from 'types'
import { ModalTitle } from 'ui-app/ModalTitle'
import { SubmitTx } from 'ui-app/SubmitTx'
import { Padding, Warnings } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'

export const UpdatePayee = () => {
	const { t } = useTranslation('modals')
	const { serviceApi } = useApi()
	const { activeProxy } = useActiveProxy()
	const { closeModal } = useOverlay().modal
	const { getStakingLedger } = useBalances()
	const { getPayeeItems } = usePayeeConfig()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAddress, activeAccount } = useActiveAccount()

	const payee = getStakingLedger(activeAddress).payee

	const DefaultSelected: PayeeConfig = {
		destination: null,
		account: null,
	}

	// Store the current user-inputted custom payout account.
	const [account, setAccount] = useState<MaybeAddress>(payee?.account || null)

	// Store the currently selected payee option.
	const [selected, setSelected] = useState<PayeeConfig>(DefaultSelected)

	// update setup progress with payee config.
	const handleChangeDestination = (destination: PayeeOption) => {
		setSelected({
			destination,
			account: isValidAddress(account || '') ? account : null,
		})
	}

	// update setup progress with payee account.
	const handleChangeAccount = (newAccount: MaybeAddress) => {
		setSelected({
			destination: selected?.destination ?? null,
			account: newAccount,
		})
	}

	// determine whether this section is completed.
	const isComplete = () =>
		selected.destination !== null &&
		!(selected.destination === 'Account' && selected.account === null)

	const getTx = () => {
		if (!selected.destination) {
			return
		}
		if (selected.destination === 'Account' && !selected.account) {
			return
		}
		return serviceApi.tx.stakingSetPayee(
			!isComplete()
				? { type: 'Staked' }
				: selected.destination === 'Account'
					? {
							type: 'Account',
							value: new AccountId32(selected.account as string),
						}
					: { type: selected.destination },
		)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: isComplete(),
		callbackSubmit: () => {
			closeModal()
		},
	})

	// Reset selected value on account change.
	useEffect(() => {
		setSelected(DefaultSelected)
	}, [activeAddress])

	// Inject default value after component mount.
	useEffect(() => {
		const initialSelected = getPayeeItems(true).find(
			(item) => item.value === payee?.destination,
		)
		setSelected(
			initialSelected
				? {
						destination: initialSelected.value,
						account,
					}
				: DefaultSelected,
		)
	}, [])

	const warnings = getSignerWarnings(
		activeAccount,
		true,
		submitExtrinsic.proxySupported,
	)

	return (
		<>
			<ModalTitle
				title={t('updatePayoutDestination')}
				helpKey="Payout Destination"
			/>
			<Padding horizontalOnly>
				{warnings.length > 0 ? (
					<Warnings>
						{warnings.map((text) => (
							<Warning key={`warning_${text}`} text={text} />
						))}
					</Warnings>
				) : null}
				<div style={{ width: '100%', padding: '0 0.5rem' }}>
					<PayeeInput
						payee={selected}
						account={account}
						setAccount={setAccount}
						handleChange={handleChangeAccount}
					/>
				</div>
				<SelectItems>
					{getPayeeItems(true).map((item) => (
						<SelectItem
							key={`payee_option_${item.value}`}
							account={account}
							setAccount={setAccount}
							selected={selected.destination === item.value}
							onClick={() => handleChangeDestination(item.value)}
							{...item}
							icon={<FontAwesomeIcon icon={item.icon} />}
						/>
					))}
				</SelectItems>
			</Padding>
			<SubmitTx
				requiresMigratedController
				valid={isComplete()}
				{...submitExtrinsic}
			/>
		</>
	)
}
