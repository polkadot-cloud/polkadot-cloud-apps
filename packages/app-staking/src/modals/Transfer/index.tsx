// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { planckToUnit, unitToPlanck } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useProxySwitcher } from 'hooks/useProxySwitcher'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { filterNonProxy, formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { AccountDropdown } from 'library/AccountDropdown'
import { BalanceInput } from 'library/Form/BalanceInput'
import { SubmitTx } from 'library/SubmitTx'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { Separator } from 'ui-core/base'
import { Padding, Title } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'

export const Transfer = () => {
	const { t } = useTranslation()
	const { serviceApi } = useApi()
	const { network } = useNetwork()
	const { activeProxy } = useActiveProxy()
	const { closeModal } = useOverlay().modal
	const { activeAccount } = useActiveAccount()
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
		accounts?.[0] || null,
	)

	// Amount to transfer
	const [amount, setAmountState] = useState<BigNumber>(new BigNumber(0))

	const {
		balances: { transferableBalance },
	} = useAccountBalances(fromAccount?.address || null)

	const { units } = getStakingChainData(network)

	const valid =
		amount.gt(0) &&
		toAccount !== null &&
		fromAccount !== null &&
		fromAccount.address !== toAccount.address

	const getTx = () => {
		if (!fromAccount || !toAccount || amount.lte(0)) {
			return
		}
		const amountPlanck = unitToPlanck(amount.toString(), units)
		const tx = serviceApi.tx.transferKeepAlive(toAccount.address, amountPlanck)
		return tx
	}

	// Initialize proxy switcher hook, allowing switching between proxies if available
	const proxySwitcher = useProxySwitcher(
		fromAccount?.address || null,
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
		shouldSubmit: true,
		callbackSubmit: () => {
			closeModal()
		},
	})

	const setAmount = ({ value }: { value: BigNumber }) => {
		setAmountState(value)
	}

	// Reset amount on from address change
	useEffect(() => {
		// If from address max balance is less than current amount, set amount to max
		const maxBalance = new BigNumber(planckToUnit(transferableBalance, units))
		if (amount.gt(maxBalance)) {
			setAmountState(maxBalance)
			return
		}
	}, [amount, fromAccount, transferableBalance])

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('send', { ns: 'app' })}</Title>

				<AccountDropdown
					initialAccount={getAccount(activeAccount)}
					accounts={accountsWithSigners}
					onSelect={setFromAccount}
					label={t('from', { ns: 'app' })}
				/>
				<Separator transparent />
				<AccountDropdown
					initialAccount={accounts?.[0] || null}
					accounts={accountsWithSigners}
					onSelect={setToAccount}
					label={t('to', { ns: 'app' })}
				/>
				<Separator transparent />
				<BalanceInput
					value={String(amount)}
					defaultValue={'0'}
					syncing={false}
					disabled={false}
					setters={[setAmount]}
					maxAvailable={new BigNumber(planckToUnit(transferableBalance, units))}
					disableTxFeeUpdate={false}
				/>
			</Padding>
			<SubmitTx valid={valid} {...submitExtrinsic} {...proxySwitcher} />
		</>
	)
}
