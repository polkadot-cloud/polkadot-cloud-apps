// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { decodeAddress, encodeAddress } from 'dedot/utils'
import type { ImportedAccount } from 'types'

export const compareAccounts = (a: ImportedAccount, b: ImportedAccount) =>
	(a.name?.trim() || a.address).localeCompare(
		b.name?.trim() || b.address,
		undefined,
		{ sensitivity: 'base' },
	) ||
	a.address.localeCompare(b.address) ||
	a.source.localeCompare(b.source)

/**
 * @name formatAccountSs58
 * @summary Formats an address with the supplied ss58 prefix, or returns null if invalid.
 */
export const formatAccountSs58 = (
	address: string,
	ss58: number,
): string | null => {
	try {
		return encodeAddress(address, ss58)
	} catch {
		return null
	}
}

/**
 * @name isValidAddress
 * @summary Return whether an address is valid Substrate address.
 */
export const isValidAddress = (address: string): boolean => {
	try {
		decodeAddress(address)
		return true
	} catch {
		return false
	}
}
