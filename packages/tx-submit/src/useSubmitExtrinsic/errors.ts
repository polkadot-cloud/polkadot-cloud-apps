// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TxFailure } from 'types'

// Match the failing pallet from runtime metadata, including errors inside wrapped calls.
const ModuleErrorKeys: Record<string, string> = {
	'AssetConversion.ProvidedMinimumNotSufficientForSwap':
		'errors.swapPriceChanged',
	'AssetConversion.ProvidedMaximumNotSufficientForSwap':
		'errors.swapPriceChanged',
	'Psm.FeeTooHigh': 'errors.conversionUnavailable',
	'Psm.ExceedsMaxPsmDebt': 'errors.conversionUnavailable',
	'Psm.InsufficientReserve': 'errors.conversionUnavailable',
	'Psm.BelowMinimumSwap': 'errors.conversionUnavailable',
	'Psm.MintingStopped': 'errors.conversionUnavailable',
	'Psm.AllSwapsStopped': 'errors.conversionUnavailable',
	'Balances.VestingBalance': 'errors.balanceErrorLocked',
	'Balances.LiquidityRestrictions': 'errors.balanceErrorLocked',
	'Balances.InsufficientBalance': 'errors.balanceErrorReserveRequired',
	'Balances.ExistentialDeposit': 'errors.balanceErrorReserveRequired',
	'Balances.Expendability': 'errors.balanceErrorReserveRequired',
	'Assets.Frozen': 'errors.balanceErrorLocked',
	'Assets.BalanceLow': 'errors.balanceErrorReserveRequired',
	'Assets.WouldDie': 'errors.balanceErrorReserveRequired',
	'AssetConversion.BelowMinimum': 'errors.balanceErrorReserveRequired',
}

// Selects a message from explicit dispatch variants; unknown failures remain generic.
export const getTxFailureKey = (failure: TxFailure): string => {
	if (failure.type === 'invalid') return 'errorWithTransaction'
	const { error, module } = failure
	if (error.type === 'Module' && module) {
		return (
			ModuleErrorKeys[`${module.pallet}.${module.name}`] ??
			'errorWithTransaction'
		)
	}
	if (error.type === 'Token') {
		switch (error.value) {
			case 'Frozen':
				return 'errors.balanceErrorLocked'
			case 'FundsUnavailable':
			case 'BelowMinimum':
			case 'OnlyProvider':
			case 'NotExpendable':
			case 'CannotCreate':
				return 'errors.balanceErrorReserveRequired'
		}
	}
	return 'errorWithTransaction'
}
