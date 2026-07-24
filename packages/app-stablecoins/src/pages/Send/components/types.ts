// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { UseSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import type {
	FeeAssetSymbol,
	ImportedAccount,
	StablecoinBalance,
	TxFeeDisplay,
} from 'types'
import type { DropdownOption } from 'ui-app/Dropdown'
import type {
	SendAccounts,
	SendSelection,
	SendTransaction,
} from '../hooks/types'

export type AccountFieldsProps = {
	accounts: ImportedAccount[]
	accountsWithSigners: ImportedAccount[]
	fromAccount: ImportedAccount | null
	onFromSelect: SendAccounts['setFromAccount']
	onToSelect: SendAccounts['setToAccount']
	toAccount: ImportedAccount | null
}

export type FeePaymentFieldsProps = {
	balancesLoading: boolean
	feeAssetOptions: DropdownOption<FeeAssetSymbol>[]
	feeBalance: StablecoinBalance | undefined
	feeDisplay: TxFeeDisplay
	feeSetupRequired: boolean
	onSelect: (option: DropdownOption<FeeAssetSymbol>) => void
	selectedFeeAsset: DropdownOption<FeeAssetSymbol>
	submission: UseSubmitExtrinsic
	submitText: string
	valid: boolean
}

export type SendFormProps = {
	accounts: SendAccounts
	selection: SendSelection
	transaction: SendTransaction
}
