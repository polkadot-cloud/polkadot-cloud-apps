// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { maxBigInt, minBigInt } from '@polkadot-cloud/utils'
import { PERBILL, PERMILL, U128_MAX } from 'consts/math'
import type { SwapPsm, SwapRequest } from 'types'
import { assertSwapAmount, ceilDiv } from 'utils'

// Matches the PSM's Perbill share rounding and the remaining aggregate debt ceiling.
export const psmDebtLimit = (
	maxDebt: bigint,
	debts: bigint[],
	weights: number[],
	index: number,
): bigint => {
	const totalWeight = weights.reduce((sum, weight) => sum + BigInt(weight), 0n)
	const weight = BigInt(weights[index] ?? 0)
	const share = totalWeight > 0n ? (weight * PERBILL) / totalWeight : 0n
	const weightedCap = (maxDebt * share) / PERBILL
	const otherDebt =
		debts.reduce((sum, debt) => sum + debt, 0n) - (debts[index] ?? 0n)
	return minBigInt(weightedCap, maxBigInt(maxDebt - otherDebt, 0n))
}

// Permill fees use mul_ceil in the PSM. Invert net = floor(gross * (1-fee)).
export const psmAmounts = (request: SwapRequest, psm: SwapPsm) => {
	const mint = request.assetIn === 'USDT' && request.assetOut === 'dotUSD'
	const redeem = request.assetIn === 'dotUSD' && request.assetOut === 'USDT'
	if (
		(!mint && !redeem) ||
		psm.status === 'AllDisabled' ||
		(mint && (psm.status !== 'AllEnabled' || psm.weight === 0))
	)
		return undefined
	assertSwapAmount(request.amount)
	const fee = mint ? psm.mintFee : psm.redeemFee
	if (!Number.isInteger(fee) || fee < 0 || fee >= Number(PERMILL))
		return undefined
	const amountIn =
		request.mode === 'exactIn'
			? request.amount
			: ceilDiv(request.amount * PERMILL, PERMILL - BigInt(fee))
	const feeAmount = ceilDiv(amountIn * BigInt(fee), PERMILL)
	const amountOut = amountIn - feeAmount
	if (amountIn > U128_MAX || amountIn < psm.minSwapAmount || amountOut <= 0n)
		return undefined
	// Minting debt includes the fee minted to the fee destination; redemption debt falls by net output.
	if (mint && psm.debt + amountIn > psm.maxDebt) return undefined
	if (redeem && (amountOut > psm.reserve || amountOut > psm.debt))
		return undefined
	return { amountIn, amountOut, fee }
}
