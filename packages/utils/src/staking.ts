// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NominationStatus } from 'types'

// Utility to get the nominees of a provided nomination status
export const filterNomineesByStatus = (
	nominees: [string, NominationStatus][],
	status: string,
): string[] =>
	nominees.filter(([_, s]) => s === status).map(([address]) => address)

// Utility to categorise nominees into active, inactive, and waiting buckets in a single pass —
// avoids three separate filter+map passes over the same array
export const groupNomineesByStatus = (
	nominees: [string, NominationStatus][],
): { active: string[]; inactive: string[]; waiting: string[] } => {
	const active: string[] = []
	const inactive: string[] = []
	const waiting: string[] = []
	for (const [address, status] of nominees) {
		if (status === 'active') {
			active.push(address)
		} else if (status === 'inactive') {
			inactive.push(address)
		} else {
			waiting.push(address)
		}
	}
	return { active, inactive, waiting }
}
