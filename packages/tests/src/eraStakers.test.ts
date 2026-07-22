// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Exposure } from 'types'
import { expect, test } from 'vitest'
import { countUniqueNominators } from '../../app-staking/src/contexts/EraStakers/util'

const exposure = (validator: string, nominators: string[]): Exposure => ({
	keys: ['1', validator],
	val: {
		own: '0',
		total: '0',
		others: nominators.map((who) => ({ who, value: '0' })),
	},
})

test('active nominators are counted once across validator exposures', () => {
	const exposures = [
		exposure('validator-1', ['nominator-1', 'nominator-2']),
		exposure('validator-2', ['nominator-1', 'nominator-3']),
	]

	expect(countUniqueNominators(exposures)).toBe(3)
})
