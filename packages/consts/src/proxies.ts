// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Staking-specific list — kept here as it has no place in the generic proxy package.
export const UnsupportedIfUniqueController: string[] = [
	'Staking.Chill',
	'Staking.Nominate',
	'Staking.Rebond',
	'Staking.Unbond',
	'Staking.SetPayee',
	'Staking.WithdrawUnbonded',
]
