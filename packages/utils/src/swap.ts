// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { maxBigInt, minBigInt } from '@polkadot-cloud/utils'
import { BASIS_POINTS, U128_MAX } from 'consts/math'
import { MaxSwapSlippageBps } from 'consts/swap'
import type { StablecoinBalance, SwapToken } from 'types'
import { maxSendableBalance } from './balances'
import { ceilDiv } from './math'

// Rejects zero, negative, and overflowing runtime token amounts.
export const assertSwapAmount = (amount: bigint) => {
	if (amount <= 0n || amount > U128_MAX) throw new Error('Invalid token amount')
}

// Uses the same positive u128 slippage bounds for display, funding checks, and encoding.
export const slippageLimit = (
	amount: bigint,
	bps: number,
	bound: 'minimum' | 'maximum' = 'minimum',
): bigint => {
	assertSwapAmount(amount)
	if (!Number.isInteger(bps) || bps < 0 || bps > MaxSwapSlippageBps)
		throw new Error(
			`Slippage must be between 0% and ${MaxSwapSlippageBps / 100}%`,
		)

	return bound === 'maximum'
		? minBigInt(
				ceilDiv(amount * (BASIS_POINTS + BigInt(bps)), BASIS_POINTS),
				U128_MAX,
			)
		: maxBigInt((amount * (BASIS_POINTS - BigInt(bps))) / BASIS_POINTS, 1n)
}

// Reserves frozen funds and minimum balances; swap outputs cannot pay upfront fees.
export const canFundExchange = (
	balances: StablecoinBalance[],
	spends: Partial<Record<SwapToken, bigint>>,
	feeAsset: SwapToken,
	fee: bigint | undefined,
): boolean => {
	if (fee === undefined || fee < 0n) return false
	const entries = Object.entries(spends)
	if (entries.some(([, amount]) => amount < 0n)) return false
	const debits = new Map(entries.filter(([, amount]) => amount > 0n))
	debits.set(feeAsset, (debits.get(feeAsset) ?? 0n) + fee)
	return [...debits].every(([token, debit]) => {
		const balance = balances.find(
			(item) => item.chain === 'statemint' && item.symbol === token,
		)
		return !!balance && debit <= maxSendableBalance(balance, undefined, 0n)
	})
}
