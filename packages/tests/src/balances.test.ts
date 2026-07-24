// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ClaimPermission } from 'types'
import {
	balanceForTxFees,
	calculateAllBalances,
	getFeeReserve,
	getFreeBalance,
	getLockedBalance,
	getTotalBalance,
	getTransferableBalance,
	getUnlocking,
	nominatorBalances,
	poolBalances,
} from 'utils'
import { expect, test } from 'vitest'

// Mock data for testing
const mockAccountBalance = {
	synced: true,
	nonce: 1,
	balance: {
		free: 1000000000000000n, // 1000 DOT
		reserved: 20000000000000n, // 20 DOT
		frozen: 50000000000000n, // 50 DOT
	},
}

const mockStakingLedger = {
	ledger: {
		stash: 'test-address',
		total: 500000000000000n, // 500 DOT
		active: 400000000000000n, // 400 DOT
		unlocking: [
			{ era: 102, value: 50000000000000n }, // 50 DOT unlocking (era > current)
			{ era: 99, value: 50000000000000n }, // 50 DOT unlocked (era <= current)
		],
	},
	payee: undefined,
	nominators: undefined,
	controllerUnmigrated: false,
}

const mockPoolMembership = {
	address: 'test-address',
	poolId: 1,
	points: 300000000000000n,
	balance: 300000000000000n, // 300 DOT
	lastRecordedRewardCounter: 0n,
	unbondingEras: [
		[102, 30000000000000n], // 30 DOT unlocking
		[98, 20000000000000n], // 20 DOT unlocked (past era)
	] as [number, bigint][],
	claimPermission: 'Permissioned' as ClaimPermission,
	pendingRewards: 5000000000000n, // 5 DOT
}

const currentEra = 101
const edReserved = 10000000000000n // 10 DOT
const feeReserve = 5000000000000n // 5 DOT

test('getUnlocking correctly separates unlocking and unlocked amounts', () => {
	const chunks = [
		{ era: 102, value: 50000000000000n }, // unlocking (era > current)
		{ era: 99, value: 30000000000000n }, // unlocked (era <= current)
		{ era: 103, value: 20000000000000n }, // unlocking (era > current)
		{ era: 98, value: 10000000000000n }, // unlocked (era <= current)
	]

	const result = getUnlocking(chunks, 101)
	expect(result.totalUnlocking).toBe(70000000000000n) // 50 + 20 (eras 102, 103)
	expect(result.totalUnlocked).toBe(40000000000000n) // 30 + 10 (eras 99, 98)
})

test('getUnlocking handles empty chunks', () => {
	const result = getUnlocking([], 101)
	expect(result.totalUnlocking).toBe(0n)
	expect(result.totalUnlocked).toBe(0n)
})

test('getFreeBalance subtracts ED reserve from free balance', () => {
	const result = getFreeBalance(mockAccountBalance, edReserved)
	expect(result).toBe(990000000000000n) // 1000 - 10
})

test('getFreeBalance handles insufficient balance', () => {
	const insufficientBalance = {
		...mockAccountBalance,
		balance: { ...mockAccountBalance.balance, free: 5000000000000n }, // 5 DOT
	}
	const result = getFreeBalance(insufficientBalance, edReserved)
	expect(result).toBe(0n) // max(5 - 10, 0) = 0
})

test('getTransferableBalance subtracts all locked amounts', () => {
	const freeBalance = 990000000000000n

	const result = getTransferableBalance(freeBalance, feeReserve)
	expect(result).toBe(985000000000000n) // 990 - 5
})

test('getTransferableBalance handles insufficient balance', () => {
	const result = getTransferableBalance(
		10000000000000n, // 10 DOT
		feeReserve,
	)
	expect(result).toBe(5000000000000n) // max(10 - 5, 0) = 0
})

test('balanceForTxFees equals getFreeBalance', () => {
	const result = balanceForTxFees(mockAccountBalance, edReserved)
	expect(result).toBe(990000000000000n) // 1000 - 10
})

test('nominatorBalances calculates all nominator-related balances', () => {
	const transferableBalance = 885000000000000n
	const result = nominatorBalances(
		mockStakingLedger,
		transferableBalance,
		currentEra,
	)

	expect(result.active).toBe(400000000000000n)
	expect(result.totalUnlocking).toBe(50000000000000n) // era 102 > 101
	expect(result.totalUnlocked).toBe(50000000000000n) // era 99 <= 101
	expect(result.totalPossibleBond).toBe(1385000000000000n) // 500 + 885
	expect(result.totalAdditionalBond).toBe(885000000000000n) // 1385 - 500
	expect(result.totalUnlockChunks).toBe(2)
})

test('nominatorBalances handles undefined ledger', () => {
	const ledgerUndefined = {
		ledger: undefined,
		payee: undefined,
		nominators: undefined,
		controllerUnmigrated: false,
	}

	const result = nominatorBalances(
		ledgerUndefined,
		885000000000000n,
		currentEra,
	)

	expect(result.active).toBe(0n)
	expect(result.totalUnlocking).toBe(0n)
	expect(result.totalUnlocked).toBe(0n)
	expect(result.totalPossibleBond).toBe(885000000000000n)
	expect(result.totalAdditionalBond).toBe(885000000000000n)
	expect(result.totalUnlockChunks).toBe(0)
})

test('poolBalances calculates all pool-related balances', () => {
	const transferableBalance = 885000000000000n
	const maxReserve = 50000000000000n

	const result = poolBalances(
		mockPoolMembership,
		transferableBalance,
		maxReserve,
		currentEra,
	)

	expect(result.active).toBe(300000000000000n)
	expect(result.totalUnlocking).toBe(30000000000000n) // era 102
	expect(result.totalUnlocked).toBe(20000000000000n) // era 98
	expect(result.totalPossibleBond).toBe(835000000000000n) // 885 - 50
	expect(result.totalUnlockChunks).toBe(2)
})

test('poolBalances handles undefined membership', () => {
	const result = poolBalances(
		undefined,
		885000000000000n,
		50000000000000n,
		currentEra,
	)

	expect(result.active).toBe(0n)
	expect(result.totalUnlocking).toBe(0n)
	expect(result.totalUnlocked).toBe(0n)
	expect(result.totalPossibleBond).toBe(835000000000000n)
	expect(result.totalUnlockChunks).toBe(0)
})

test('getTotalBalance sums all account balances', () => {
	const nominatorActive = 400000000000000n
	const poolActive = 300000000000000n
	const poolUnlocking = 30000000000000n
	const poolUnlocked = 20000000000000n

	const result = getTotalBalance(
		mockAccountBalance,
		nominatorActive,
		poolActive,
		poolUnlocking,
		poolUnlocked,
	)

	expect(result).toBe(1750000000000000n) // 1000 + 400 + 300 + 30 + 20
})

test('getLockedBalance calculates locked funds correctly', () => {
	const nominatorActive = 400000000000000n
	const poolTotal = 350000000000000n // 300 + 30 + 20

	const result = getLockedBalance(
		mockAccountBalance,
		nominatorActive,
		poolTotal,
	)

	// maxReserve = max(50, 20) = 50
	// locked = max(50 - 400 - 350, 0) = 0
	expect(result).toBe(0n)
})

test('getLockedBalance with higher reserves', () => {
	const highReserveBalance = {
		...mockAccountBalance,
		balance: {
			...mockAccountBalance.balance,
			frozen: 800000000000000n, // 800 DOT
			reserved: 100000000000000n, // 100 DOT
		},
	}

	const result = getLockedBalance(
		highReserveBalance,
		400000000000000n,
		350000000000000n,
	)

	// maxReserve = max(800, 100) = 800
	// locked = max(800 - 400 - 350, 0) = 50
	expect(result).toBe(50000000000000n)
})

test('calculateAllBalances provides comprehensive balance calculations', () => {
	const result = calculateAllBalances(
		mockAccountBalance,
		mockStakingLedger,
		mockPoolMembership,
		edReserved,
		feeReserve,
		currentEra,
	)

	// Verify all calculated fields
	expect(result.freeBalance).toBe(990000000000000n) // 1000 - 10
	expect(result.transferableBalance).toBe(985000000000000n) // 990 - 5
	expect(result.balanceTxFees).toBe(990000000000000n) // 1000 - 10
	expect(result.edReserved).toBe(edReserved)

	// Verify nominator balances
	expect(result.nominator.active).toBe(400000000000000n)
	expect(result.nominator.totalUnlocking).toBe(50000000000000n)
	expect(result.nominator.totalUnlocked).toBe(50000000000000n)
	expect(result.nominator.totalPossibleBond).toBe(1485000000000000n)
	expect(result.nominator.totalAdditionalBond).toBe(985000000000000n)
	expect(result.nominator.totalUnlockChunks).toBe(2)

	// Verify pool balances
	expect(result.pool.active).toBe(300000000000000n)
	expect(result.pool.totalUnlocking).toBe(30000000000000n)
	expect(result.pool.totalUnlocked).toBe(20000000000000n)
	expect(result.pool.totalPossibleBond).toBe(935000000000000n) // 885
	expect(result.pool.totalUnlockChunks).toBe(2)

	// Verify total and locked
	expect(result.totalBalance).toBe(1750000000000000n)
	expect(result.lockedBalance).toBe(0n)
})

test('calculateAllBalances handles edge cases with zero balances', () => {
	const zeroBalance = {
		synced: true,
		nonce: 0,
		balance: {
			free: 0n,
			reserved: 0n,
			frozen: 0n,
		},
	}

	const emptyLedger = {
		ledger: undefined,
		payee: undefined,
		nominators: undefined,
		controllerUnmigrated: false,
	}

	const result = calculateAllBalances(
		zeroBalance,
		emptyLedger,
		undefined,
		0n,
		0n,
		currentEra,
	)

	expect(result.freeBalance).toBe(0n)
	expect(result.transferableBalance).toBe(0n)
	expect(result.balanceTxFees).toBe(0n)
	expect(result.totalBalance).toBe(0n)
	expect(result.lockedBalance).toBe(0n)
	expect(result.nominator.active).toBe(0n)
	expect(result.pool.active).toBe(0n)
})

const defaultReserve = 5000000000000n // 5 DOT

test('getFeeReserve returns the stored reserve when above the default', () => {
	expect(getFeeReserve('10000000000000', defaultReserve)).toBe(10000000000000n)
})

test('getFeeReserve falls back to the default when stored is below it', () => {
	expect(getFeeReserve('1000000000000', defaultReserve)).toBe(defaultReserve)
})

test('getFeeReserve falls back to the default for missing values', () => {
	expect(getFeeReserve(undefined, defaultReserve)).toBe(defaultReserve)
	expect(getFeeReserve(null, defaultReserve)).toBe(defaultReserve)
	expect(getFeeReserve('', defaultReserve)).toBe(defaultReserve)
})

test('getFeeReserve falls back to the default for malformed values', () => {
	expect(getFeeReserve('not-a-bigint', defaultReserve)).toBe(defaultReserve)
})
