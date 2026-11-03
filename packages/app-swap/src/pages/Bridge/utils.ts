// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	CrossChainTransfer,
	CrossChainTransferInput,
	StablecoinBalance,
} from 'types'

// Reject invalid input and excess precision instead of rounding a user's transfer.
export const parseTransferAmount = (
	amount: string,
	decimals: number,
): bigint => {
	if (!/^\d+(\.\d+)?$/.test(amount)) return 0n
	const [whole, fraction = ''] = amount.split('.')
	if (fraction.length > decimals) return 0n
	return (
		BigInt(whole) * 10n ** BigInt(decimals) +
		BigInt(fraction.padEnd(decimals, '0'))
	)
}

// Accumulate fees by asset before checking balances, including when the sent asset pays fees.
export const canFundTransfer = (
	balances: StablecoinBalance[],
	input: CrossChainTransferInput,
	quote: CrossChainTransfer,
	networkFee: bigint,
): boolean => {
	const spends = new Map<string, bigint>([[input.symbol, input.amount]])
	for (const [symbol, amount] of [
		[input.feeAsset, networkFee],
		[
			quote.originFee.symbol,
			quote.originFeeFromAmount ? 0n : quote.originFee.amount,
		],
	] as const) {
		spends.set(symbol, (spends.get(symbol) ?? 0n) + amount)
	}
	return [...spends].every(([symbol, amount]) => {
		const balance = balances.find(
			(item) => item.chain === input.from && item.symbol === symbol,
		)
		if (!balance) return false
		const floor =
			balance.frozen > balance.existentialDeposit
				? balance.frozen
				: balance.existentialDeposit
		return balance.free - floor >= amount
	})
}
