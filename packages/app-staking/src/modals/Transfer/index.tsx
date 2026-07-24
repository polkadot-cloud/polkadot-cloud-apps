// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { planckToUnit, unitToPlanck } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useProxySwitcher } from 'hooks/useProxySwitcher'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { filterNonProxy, formatFromProp } from 'tx-submit/util'
import type { ImportedAccount } from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { BalanceInput } from 'ui-app/BalanceInput'
import { SubmitTx } from 'ui-app/SubmitTx'
import { Separator } from 'ui-core/base'
import { Padding, Title } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'

export const Transfer = () => {
	const { t } = useTranslation()
	const { serviceApi } = useApi()
	const { network } = useNetwork()
	const { activeProxy } = useActiveProxy()
	const { closeModal } = useOverlay().modal
	const { activeAddress, activeAccount } = useActiveAccount()
	const { accounts, accountHasSigner, getAccount } = useImportedAccounts()

	// Filter accounts to only show those with signers
	const accountsWithSigners = accounts.filter((account) =>
		accountHasSigner({ address: account.address, source: account.source }),
	)

	// From account
	const [fromAccount, setFromAccount] = useState<ImportedAccount | null>(
		getAccount(activeAccount),
	)

	// To account
	const [toAccount, setToAccount] = useState<ImportedAccount | null>(
		accounts?.[0] ?? null,
	)

	// Amount to transfer
	const [amount, setAmount] = useState('0')
	const handleFromAccountChange = (account: ImportedAccount | null) => {
		setFromAccount(account)
		setAmount('0')
	}

	const {
		balances: { transferableBalance },
	} = useAccountBalances(fromAccount?.address ?? null)

	const { units } = getStakingChainData(network)
	const amountPlanck = unitToPlanck(amount || '0', units)

	const valid =
		amountPlanck > 0n &&
		amountPlanck <= transferableBalance &&
		toAccount !== null &&
		fromAccount !== null &&
		fromAccount.address !== toAccount.address

	const getTx = () => {
		if (!valid || !fromAccount || !toAccount) {
			return
		}
		return serviceApi.tx.transferKeepAlive(toAccount.address, amountPlanck)
	}

	// Initialize proxy switcher hook, allowing switching between proxies if available
	const proxySwitcher = useProxySwitcher(
		fromAccount?.address ?? null,
		activeProxy,
		fromAccount
			? { address: fromAccount.address, source: fromAccount.source }
			: null,
	)

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(
			fromAccount,
			filterNonProxy(proxySwitcher.currentSigner),
		),
		shouldSubmit: valid,
		callbackSubmit: () => {
			closeModal()
		},
	})

	useEffect(() => setAmount('0'), [activeAddress])

	// Clamp the amount when the selected account's available balance decreases.
	useEffect(() => {
		if (amountPlanck > transferableBalance) {
			setAmount(planckToUnit(transferableBalance, units))
		}
	}, [amountPlanck, transferableBalance, units])

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('send', { ns: 'app' })}</Title>

				<AccountDropdown
					initialAccount={getAccount(activeAccount)}
					accounts={accountsWithSigners}
					onSelect={handleFromAccountChange}
					label={t('from', { ns: 'app' })}
				/>
				<Separator transparent />
				<AccountDropdown
					initialAccount={accounts?.[0] ?? null}
					accounts={accountsWithSigners}
					onSelect={setToAccount}
					label={t('to', { ns: 'app' })}
				/>
				<Separator transparent />
				<BalanceInput
					value={amount}
					onChange={setAmount}
					maxAvailable={planckToUnit(transferableBalance, units)}
				/>
			</Padding>
			<SubmitTx valid={valid} {...submitExtrinsic} {...proxySwitcher} />
		</>
	)
}
