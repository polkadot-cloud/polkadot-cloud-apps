// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { Dispatch, SetStateAction } from 'react'
import type { TxFeeEstimator, UseSubmitExtrinsic } from 'tx-submit/types'
import type {
	FeeAssetSymbol,
	ImportedAccount,
	SendAssetSymbol,
	ServiceInterface,
	StablecoinBalance,
	StablecoinChainId,
	TxFeeDisplay,
} from 'types'
import type { DropdownOption } from 'ui-app/Dropdown'

export type SendAccounts = {
	accounts: ImportedAccount[]
	accountsWithSigners: ImportedAccount[]
	fromAccount: ImportedAccount | null
	setFromAccount: Dispatch<SetStateAction<ImportedAccount | null>>
	toAccount: ImportedAccount | null
	setToAccount: Dispatch<SetStateAction<ImportedAccount | null>>
}

export type SendSelectionState = {
	amount: string
	chain: StablecoinChainId
	feeAsset: FeeAssetSymbol
	token: SendAssetSymbol
}

export type SendSelectionAction =
	| { type: 'setAmount'; amount: string }
	| { type: 'selectChain'; chain: StablecoinChainId }
	| { type: 'selectFeeAsset'; feeAsset: FeeAssetSymbol }
	| { type: 'selectToken'; token: SendAssetSymbol }

export type SendSelection = SendSelectionState & {
	availableFeeAssetOptions: DropdownOption<FeeAssetSymbol>[]
	chainOptions: DropdownOption<StablecoinChainId>[]
	selectedChain: DropdownOption<StablecoinChainId>
	selectedFeeAsset: DropdownOption<FeeAssetSymbol>
	selectedToken: DropdownOption<SendAssetSymbol>
	setAmount: (amount: string) => void
	setSelectedChain: (option: DropdownOption<StablecoinChainId>) => void
	setSelectedFeeAsset: (option: DropdownOption<FeeAssetSymbol>) => void
	setSelectedToken: (option: DropdownOption<SendAssetSymbol>) => void
	tokenOptions: DropdownOption<SendAssetSymbol>[]
}

export type FeeCurrencyStatus = 'error' | 'idle' | 'loading' | 'ready'

export type FeeCurrencyState = {
	currency?: FeeAssetSymbol
	key: string
	status: Exclude<FeeCurrencyStatus, 'idle'>
}

export type ResolvedFeeSetupTx = {
	key: string
	tx: SubmittableExtrinsic | undefined
}

export type UseHydrationFeeSetupProps = {
	chain: StablecoinChainId
	feeAsset: FeeAssetSymbol
	feeDisplay: TxFeeDisplay
	feeEstimator: TxFeeEstimator
	fromAccount: ImportedAccount | null
	refreshBalances: () => Promise<void>
}

export type HydrationFeeSetup = {
	needsSetup: boolean
	ready: boolean
	status: FeeCurrencyStatus
	submission: UseSubmitExtrinsic
	valid: boolean
}

export type ResolvedTransferTx = {
	key: string
	serviceApi: ServiceInterface
	tx: SubmittableExtrinsic | undefined
}

export type UseSendTransactionProps = {
	amount: string
	chain: StablecoinChainId
	feeAsset: FeeAssetSymbol
	fromAccount: ImportedAccount | null
	toAccount: ImportedAccount | null
	token: SendAssetSymbol
}

export type SendTransaction = {
	balancesLoading: boolean
	feeDisplay: TxFeeDisplay
	feeSetupRequired: boolean
	maxAvailableToSend: bigint
	selectedDecimals: number
	selectedFeeAssetBalance: StablecoinBalance | undefined
	submission: UseSubmitExtrinsic
	submitText: string
	valid: boolean
}
