// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TxFailure } from 'types'
import { expect, test } from 'vitest'
import { getTxFailureKey } from '../../tx-submit/src/useSubmitExtrinsic/errors'

const moduleFailure = (pallet: string, name: string): TxFailure => ({
	type: 'dispatch',
	error: { type: 'Module', value: { index: 55, error: '0x00000000' } },
	module: { pallet, name },
})

test.each([
	'ProvidedMinimumNotSufficientForSwap',
	'ProvidedMaximumNotSufficientForSwap',
])('the AMM %s error reports the price limit failure', (name) => {
	expect(getTxFailureKey(moduleFailure('AssetConversion', name))).toBe(
		'errors.swapPriceChanged',
	)
})

test.each([
	'FeeTooHigh',
	'ExceedsMaxPsmDebt',
	'InsufficientReserve',
	'BelowMinimumSwap',
	'MintingStopped',
	'AllSwapsStopped',
])('the PSM %s error reports an unavailable conversion', (name) => {
	expect(getTxFailureKey(moduleFailure('Psm', name))).toBe(
		'errors.conversionUnavailable',
	)
})

test.each([
	['Treasury', 'ExceedsMaxMessageSize'],
	['OtherPallet', 'FeeTooHigh'],
	['OtherPallet', 'ProvidedMinimumNotSufficientForSwap'],
	['Psm', 'FeeTooHighExtra'],
	['Psm', 'Unexpected'],
	['AssetConversion', 'InsufficientLiquidityMinted'],
	['AssetConversion', 'InvalidPath'],
])(
	'%s.%s stays generic instead of being classified by keywords',
	(pallet, name) => {
		expect(getTxFailureKey(moduleFailure(pallet, name))).toBe(
			'errorWithTransaction',
		)
	},
)

test('an undecoded module error stays generic', () => {
	expect(
		getTxFailureKey({
			type: 'dispatch',
			error: { type: 'Module', value: { index: 255, error: '0xff000000' } },
		}),
	).toBe('errorWithTransaction')
})

test.each([
	['Balances', 'LiquidityRestrictions', 'errors.balanceErrorLocked'],
	['Assets', 'Frozen', 'errors.balanceErrorLocked'],
	['Balances', 'InsufficientBalance', 'errors.balanceErrorReserveRequired'],
	['Assets', 'WouldDie', 'errors.balanceErrorReserveRequired'],
])('%s.%s retains its specific balance message', (pallet, name, key) => {
	expect(getTxFailureKey(moduleFailure(pallet, name))).toBe(key)
})

test('token errors retain their structured reason', () => {
	expect(
		getTxFailureKey({
			type: 'dispatch',
			error: { type: 'Token', value: 'Frozen' },
		}),
	).toBe('errors.balanceErrorLocked')
	expect(
		getTxFailureKey({
			type: 'dispatch',
			error: { type: 'Token', value: 'FundsUnavailable' },
		}),
	).toBe('errors.balanceErrorReserveRequired')
})

test('invalid transactions and other dispatch failures stay generic', () => {
	expect(getTxFailureKey({ type: 'invalid' })).toBe('errorWithTransaction')
	expect(
		getTxFailureKey({ type: 'dispatch', error: { type: 'BadOrigin' } }),
	).toBe('errorWithTransaction')
})
