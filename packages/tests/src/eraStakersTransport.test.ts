// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test, vi } from 'vitest'
import { erasStakersPagedEntries } from '../../dedot-api/src/query/erasStakersPagedEntries'

test.each([0, 2])(
	'era scans preserve validator, page and nominator keys with SS58 prefix %s',
	async (prefix) => {
		const validator = { address: vi.fn(() => 'validator') }
		const nominator = { address: vi.fn(() => 'pool-stash') }
		const entries = vi.fn(async () => [
			[
				[100, validator, 1],
				{
					pageTotal: 90071992547409930n,
					others: [{ who: nominator, value: 90071992547409930n }],
				},
			],
		])
		const api = {
			query: { staking: { erasStakersPaged: { entries } } },
			consts: { system: { ss58Prefix: prefix } },
		} as unknown as Parameters<typeof erasStakersPagedEntries>[0]
		expect(await erasStakersPagedEntries(api, 100)).toEqual([
			[
				[100, 'validator', 1],
				{
					pageTotal: 90071992547409930n,
					others: [{ who: 'pool-stash', value: 90071992547409930n }],
				},
			],
		])
		expect(entries.mock.calls).toEqual([[100]])
		expect(validator.address).toHaveBeenCalledWith(prefix)
		expect(nominator.address).toHaveBeenCalledWith(prefix)

		// Existing nomination-status queries still request just one validator's pages.
		await erasStakersPagedEntries(api, 100, `0x${'01'.repeat(32)}`)
		expect(entries).toHaveBeenLastCalledWith(100, expect.anything())
	},
)
