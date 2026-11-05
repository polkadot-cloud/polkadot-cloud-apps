// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { BondFor } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useUnbondDuration } from '../../hooks/src/useUnbondDuration'

const { state, defaults } = vi.hoisted(() => {
	const defaults = {
		activeAddress: 'validator' as string | null,
		bondDuration: 28,
		unbondDuration: 2,
		eraSeconds: 86_400,
	}
	return { defaults, state: { ...defaults } }
})

vi.mock('../../hooks/node_modules/@polkadot-cloud/connect/index.js', () => ({
	useActiveAccount: () => ({ activeAddress: state.activeAddress }),
}))
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({
		getConsts: () => ({
			bondDuration: state.bondDuration,
			unbondDuration: state.unbondDuration,
		}),
	}),
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/useValidators', () => ({
	useValidators: () => ({
		isValidator: (address: string | null) => address === 'validator',
	}),
}))
vi.mock('../../hooks/src/useErasToTimeLeft', () => ({
	useErasToTimeLeft: () => ({
		erasToSeconds: (eras: number) => eras * state.eraSeconds,
	}),
}))

const t = ((key: string) => (key === 'time.day' ? 'days' : key)) as Parameters<
	ReturnType<typeof useUnbondDuration>['formatUnbondDuration']
>[0]

beforeEach(() => {
	Object.assign(state, defaults)
	vi.useFakeTimers()
	vi.setSystemTime(new Date('2026-11-05T00:00:00Z'))
})

afterEach(() => {
	vi.useRealTimers()
})

test.each<{ address: string; bondFor: BondFor; eras: number }>([
	{ address: 'validator', bondFor: 'nominator', eras: 28 },
	{ address: 'nominator', bondFor: 'nominator', eras: 2 },
	{ address: 'validator', bondFor: 'pool', eras: 2 },
	{ address: 'nominator', bondFor: 'pool', eras: 2 },
])(
	'$address unbonding from $bondFor displays $eras eras as days',
	({ address, bondFor, eras }) => {
		state.activeAddress = address
		const { unbondDuration, formatUnbondDuration } = useUnbondDuration(bondFor)

		expect(unbondDuration).toBe(eras)
		expect(formatUnbondDuration(t)).toBe(`${eras} days`)
	},
)

test('duration follows the active account when switching between validators and nominators', () => {
	expect(useUnbondDuration('nominator').unbondDuration).toBe(28)
	state.activeAddress = 'nominator'
	expect(useUnbondDuration('nominator').unbondDuration).toBe(2)
	state.activeAddress = 'validator'
	expect(useUnbondDuration('nominator').unbondDuration).toBe(28)
})

test('durations and displayed time come from the active network constants', () => {
	Object.assign(state, {
		bondDuration: 40,
		unbondDuration: 8,
		eraSeconds: 21_600,
	})
	const validator = useUnbondDuration('nominator')
	expect(validator.unbondDuration).toBe(40)
	expect(validator.formatUnbondDuration(t)).toBe('10 days')
	const pool = useUnbondDuration('pool')
	expect(pool.unbondDuration).toBe(8)
	expect(pool.formatUnbondDuration(t)).toBe('2 days')
})

test('nominators and pools retain the full duration when fast unbonding is unavailable', () => {
	state.unbondDuration = 28
	state.activeAddress = 'nominator'
	expect(useUnbondDuration('nominator').unbondDuration).toBe(28)
	expect(useUnbondDuration('pool').unbondDuration).toBe(28)
})
