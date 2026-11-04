// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { decodeAddress, u8aToHex } from 'dedot/utils'
import type { CrossChainTransfer, CrossChainTransferInput } from 'types'

type Receipt = {
	baseline: bigint
	amount: bigint
	receivedBalance?: bigint
	onReceived?: () => void
}
type BalanceLedger = {
	creditedBalance: bigint
	balance: bigint
	receipts: Set<Receipt>
}

// Retain credited balances after completion: another submitted quote may predate that receipt.
const ledgers = new Map<string, BalanceLedger>()
const maximum = (a: bigint, b: bigint) => (a > b ? a : b)

const stop = (ledger: BalanceLedger, receipt: Receipt) => {
	receipt.onReceived = undefined
	// Keep unconfirmed reservations: a late receipt must not confirm a different transfer.
	if (receipt.receivedBalance === undefined) return
	ledger.creditedBalance = maximum(
		ledger.creditedBalance,
		receipt.receivedBalance,
	)
	ledger.receipts.delete(receipt)
}

const update = (ledger: BalanceLedger, balance: bigint) => {
	ledger.balance = balance
	// A later withdrawal can spend a previously credited receipt.
	if (balance < ledger.creditedBalance) ledger.creditedBalance = balance
	let expectedBalance = ledger.creditedBalance
	const callbacks: (() => void)[] = []
	// Reserve disjoint increases in submission order, including receipts awaiting source finality.
	for (const receipt of ledger.receipts) {
		if (receipt.receivedBalance !== undefined) {
			expectedBalance = maximum(expectedBalance, receipt.receivedBalance)
			continue
		}
		expectedBalance =
			maximum(expectedBalance, receipt.baseline) + receipt.amount
		if (balance < expectedBalance) continue
		receipt.receivedBalance = expectedBalance
		if (receipt.onReceived) callbacks.push(receipt.onReceived)
		else stop(ledger, receipt)
	}
	// Allocate every receipt before callbacks can remove or finalize their trackers.
	for (const callback of callbacks) {
		try {
			callback()
		} catch {
			// One notification must not prevent the other allocated receipts from completing.
		}
	}
}

export const reserveCrossChainReceipt = (
	{ recipient, to, symbol }: CrossChainTransferInput,
	quote: CrossChainTransfer,
	onReceived: () => void,
) => {
	const key = `${to}:${symbol}:${u8aToHex(decodeAddress(recipient))}`
	const ledger = ledgers.get(key) ?? {
		creditedBalance: quote.destinationBalance,
		balance: quote.destinationBalance,
		receipts: new Set<Receipt>(),
	}
	ledgers.set(key, ledger)
	const receipt: Receipt = {
		baseline: quote.destinationBalance,
		amount: quote.receivedAmount,
		onReceived,
	}
	ledger.receipts.add(receipt)
	update(ledger, ledger.balance)
	return {
		update: (balance: bigint) => update(ledger, balance),
		stop: () => stop(ledger, receipt),
		cancel: () => {
			receipt.onReceived = undefined
			ledger.receipts.delete(receipt)
			update(ledger, ledger.balance)
		},
	}
}
