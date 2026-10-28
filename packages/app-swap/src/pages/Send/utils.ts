// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit, unitToPlanck } from '@polkadot-cloud/utils'
import type { ImportedAccount, StablecoinBalance } from 'types'

export const isSameImportedAccount = (
	a: ImportedAccount | null,
	b: ImportedAccount | null,
) => !!a && !!b && a.address === b.address && a.source === b.source

export const isSameAddress = (
	a: ImportedAccount | null,
	b: ImportedAccount | null,
) => !!a?.address && a.address === b?.address

export const toPlanck = (amount: string, decimals: number): bigint => {
	try {
		return BigInt(unitToPlanck(amount || '0', decimals).toString())
	} catch {
		return 0n
	}
}

export const formatBalance = (
	balance: StablecoinBalance | undefined,
	symbol: string,
): string => {
	if (!balance) {
		return `0 ${symbol}`
	}

	return `${planckToUnit(balance.free, balance.decimals)} ${symbol}`
}
