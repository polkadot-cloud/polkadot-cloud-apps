// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, expect, test, vi } from 'vitest'
import { useNominationStatusData } from '../../app-staking/src/library/ListItem/Labels/NominationStatus'
import { fetchGetStakerWithNominees } from '../../plugin-staking-api/src/queries/getStakerWithNominees'

const { query, getActiveValidator, syncing } = vi.hoisted(() => ({
	query: vi.fn(),
	getActiveValidator: vi.fn(),
	syncing: { value: true },
}))

vi.mock('../../plugin-staking-api/src/Client', () => ({ client: { query } }))
vi.mock('contexts/EraStakers', () => ({
	useEraStakers: () => ({
		getActiveValidator,
		eraStakers: { activeAccountOwnStake: [] },
	}),
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../consts/src/util', () => ({
	getStakingChainData: () => ({ unit: 'DOT', units: 10 }),
}))
vi.mock('../../hooks/src/useSyncing', () => ({
	useSyncing: () => ({ syncing: syncing.value }),
}))
vi.mock('library/BondStatus', () => ({ BondStatus: () => null }))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({
			t: (key: string) => key,
			i18n: { resolvedLanguage: 'en' },
		}),
	}),
)

afterEach(() => {
	vi.resetAllMocks()
	syncing.value = true
})

test('the nominee query requests backing stake and preserves planck precision per validator', async () => {
	const statuses = [
		{
			address: 'active',
			status: 'active',
			activeBacking: '12345678901234567890',
		},
		{ address: 'inactive', status: 'inactive', activeBacking: '0' },
		{ address: 'waiting', status: 'waiting', activeBacking: '0' },
		{ address: 'invalid', status: 'invalid', activeBacking: '0' },
	]
	query.mockResolvedValue({
		data: { isActiveStaker: { active: true }, getNomineesStatus: { statuses } },
	})
	expect(
		await fetchGetStakerWithNominees(
			'polkadot',
			100,
			'nominator',
			statuses.map(({ address }) => address),
		),
	).toEqual({ active: true, statuses })
	const request = query.mock.calls[0][0]
	expect(request.query.loc.source.body).toMatch(
		/statuses\s*\{\s*address\s*status\s*activeBacking\s*\}/,
	)
	expect(request.variables).toEqual({
		network: 'polkadot',
		era: 100,
		who: 'nominator',
		addresses: statuses.map(({ address }) => address),
	})
})

test('an unavailable API returns the existing empty fallback', async () => {
	query.mockRejectedValue(new Error('unavailable'))
	expect(
		await fetchGetStakerWithNominees('polkadot', 100, 'nominator', [
			'validator',
		]),
	).toEqual({
		active: false,
		statuses: [],
	})
})

test.each(['nominator', 'pool'] as const)(
	'%s summaries use API stake while node exposures are still syncing',
	(bondFor) => {
		const result = useNominationStatusData({
			address: 'validator',
			nominator: 'stash',
			bondFor,
			status: 'active',
			activeBacking: '12345678901234567890',
		})
		expect(result.totalActiveBacking.toFixed()).toBe('1234567890.123456789')
		expect(result.label).toBe('backing')
		expect(result.syncing).toBe(false)
		expect(result.value).not.toBe('...')
		expect(getActiveValidator).not.toHaveBeenCalled()
	},
)

test('API loading and zero stake do not fall back to node exposures', () => {
	const props = {
		address: 'validator',
		nominator: 'stash',
		bondFor: 'nominator' as const,
		status: 'inactive' as const,
		activeBacking: '0',
	}
	const loading = useNominationStatusData({ ...props, isPreloading: true })
	expect(loading.syncing).toBe(true)
	const ready = useNominationStatusData(props)
	expect(ready.syncing).toBe(false)
	expect(ready.totalActiveBacking.isZero()).toBe(true)
	expect(ready.label).toBe('notBacking')
	expect(ready.value).toBeUndefined()
	expect(getActiveValidator).not.toHaveBeenCalled()
})

test.each(['nominator', 'pool'] as const)(
	'%s summaries display supplied node backing with loading',
	(bondFor) => {
		const result = useNominationStatusData({
			address: 'validator',
			nominator: 'stash',
			bondFor,
			status: 'active',
			activeBacking: '25000000000',
			isPreloading: true,
		})
		expect(result.totalActiveBacking.toFixed()).toBe('2.5')
		expect(result.syncing).toBe(true)
		expect(result.value).toBe('...')
		expect(getActiveValidator).not.toHaveBeenCalled()
	},
)

test('unavailable backing shows an unknown label rather than an inactive result', () => {
	const result = useNominationStatusData({
		address: 'validator',
		nominator: 'stash',
		bondFor: 'nominator',
		status: 'waiting',
		activeBacking: '0',
		unavailable: true,
	})
	expect(result.label).toBe('—')
	expect(result.value).toBeUndefined()
})

test('incoming reward labels do not look up exposure data', () => {
	const result = useNominationStatusData({
		address: 'stash',
		nominator: 'stash',
		bondFor: 'nominator',
		status: 'active',
		asIncoming: true,
	})
	expect(result.label).toBe('activelyNominating')
	expect(result.syncing).toBe(false)
	expect(getActiveValidator).not.toHaveBeenCalled()
})
