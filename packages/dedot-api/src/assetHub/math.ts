// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	AssetHubPool,
	AssetHubPsm,
	AssetHubSwapRequest,
	AssetHubToken,
	StablecoinBalance,
} from 'types'

export const PERMILL = 1_000_000n
export const U128_MAX = (1n << 128n) - 1n

// Outputs cannot fund an upfront fee. Reserve minimum balances and frozen funds
// together with every planned debit, including a fee paid in the input asset.
export const canFundExchange = (
	balances: StablecoinBalance[],
	spends: Partial<Record<AssetHubToken, bigint>>,
	feeAsset: AssetHubToken,
	fee: bigint | undefined,
) => {
	if (fee === undefined || fee < 0n) return false
	const debits = new Map<string, bigint>(
		Object.entries(spends).filter(([, amount]) => amount > 0n),
	)
	debits.set(feeAsset, (debits.get(feeAsset) ?? 0n) + fee)
	for (const [token, debit] of debits) {
		const balance = balances.find(
			(item) => item.chain === 'statemint' && item.symbol === token,
		)
		if (!balance) return false
		const floor =
			balance.frozen > balance.existentialDeposit
				? balance.frozen
				: balance.existentialDeposit
		if (balance.free < floor + debit) return false
	}
	return true
}
export const ceilDiv = (value: bigint, divisor: bigint) => {
	if (value < 0n || divisor <= 0n) throw new Error('Invalid division')
	return (value + divisor - 1n) / divisor
}

export const assertAmount = (amount: bigint) => {
	if (amount <= 0n || amount > U128_MAX) throw new Error('Invalid token amount')
}

export const slippageLimit = (amount: bigint, bps: number, maximum = false) => {
	assertAmount(amount)
	if (!Number.isInteger(bps) || bps < 0 || bps > 500)
		throw new Error('Slippage must be between 0% and 5%')
	return maximum
		? ceilDiv(amount * BigInt(10_000 + bps), 10_000n)
		: (amount * BigInt(10_000 - bps)) / 10_000n
}

// Permill fees use mul_ceil in the PSM. Invert net = floor(gross * (1-fee)).
export const psmAmounts = (request: AssetHubSwapRequest, psm: AssetHubPsm) => {
	const mint = request.assetIn === 'USDT' && request.assetOut === 'dotUSD'
	const redeem = request.assetIn === 'dotUSD' && request.assetOut === 'USDT'
	if (
		(!mint && !redeem) ||
		psm.status === 'AllDisabled' ||
		(mint && (psm.status !== 'AllEnabled' || psm.weight === 0))
	)
		return undefined
	assertAmount(request.amount)
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

export const liquidityContribution = (
	pool: AssetHubPool,
	dotDesired: bigint,
	assetDesired: bigint,
) => {
	assertAmount(dotDesired)
	assertAmount(assetDesired)
	if (pool.reserveDot <= 0n || pool.reserveAsset <= 0n || pool.lpSupply <= 0n)
		throw new Error('Pool has no liquidity')
	const optimalAsset = (dotDesired * pool.reserveAsset) / pool.reserveDot
	const [dot, asset] =
		optimalAsset <= assetDesired
			? [dotDesired, optimalAsset]
			: [(assetDesired * pool.reserveDot) / pool.reserveAsset, assetDesired]
	if (dot === 0n || asset === 0n)
		throw new Error('Amount is too small for this pool')
	const dotLp = (dot * pool.lpSupply) / pool.reserveDot
	const assetLp = (asset * pool.lpSupply) / pool.reserveAsset
	const lp = dotLp < assetLp ? dotLp : assetLp
	if (lp <= pool.minLiquidity)
		throw new Error('Amount is too small to mint liquidity tokens')
	return { dot, asset, lp }
}

export const liquidityWithdrawal = (pool: AssetHubPool, burn: bigint) => {
	assertAmount(burn)
	if (pool.lpFrozen || burn > pool.lpBalance || pool.lpSupply <= 0n)
		throw new Error('Insufficient available LP tokens')
	if (pool.lpBalance !== burn && pool.lpBalance - burn < pool.lpMinBalance)
		throw new Error('Remaining LP balance would be below the minimum')
	const redeemed = burn - (burn * BigInt(pool.withdrawalFee)) / PERMILL
	const dot = (redeemed * pool.reserveDot) / pool.lpSupply
	const asset = (redeemed * pool.reserveAsset) / pool.lpSupply
	if (dot === 0n || asset === 0n) throw new Error('Withdrawal is too small')
	return { dot, asset }
}
