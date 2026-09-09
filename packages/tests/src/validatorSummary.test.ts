// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ErasStakersOverviewEntries } from 'types'
import { stringToBn } from 'utils'
import { beforeEach, expect, test, vi } from 'vitest'
import { useValidatorSelfStake } from '../../app-staking/src/library/ValidatorList/useValidatorSelfStake'
import { useValidatorSummaryData } from '../../app-staking/src/library/ValidatorList/ValidatorSummary'

const { node, getValidatorTotalStake, getActiveValidator } = vi.hoisted(() => ({
	node: {
		syncing: true,
		overviews: undefined as
			| Map<string, ErasStakersOverviewEntries[number][1]>
			| undefined,
	},
	getValidatorTotalStake: vi.fn(),
	getActiveValidator: vi.fn(),
}))

vi.mock('contexts/EraStakers', () => ({
	useEraStakers: () => ({
		validatorOverviews: node.overviews,
		eraStakers: { stakers: [], activeAccountOwnStake: [] },
		getActiveValidator,
	}),
}))
vi.mock('contexts/Validators/ValidatorEntries', () => ({
	useValidators: () => ({ getValidatorTotalStake }),
}))
vi.mock('../../hooks/src/useSyncing', () => ({
	useSyncing: () => ({ syncing: node.syncing }),
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/useStakingMetrics', () => ({
	useHardCapSelfStake: () => undefined,
}))
vi.mock('../../consts/src/util', () => ({
	getStakingChainData: () => ({ unit: 'DOT', units: 10 }),
}))
vi.mock('../../app-staking/src/library/ListItem/Labels/ActivityTier', () => ({
	ActivityTier: () => null,
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({
			t: (key: string) => key,
			i18n: { resolvedLanguage: 'en' },
		}),
	}),
)

const props = {
	address: 'validator',
	// The injected status still waits for paged exposures.
	status: 'waiting' as const,
	selfStakeMax: false,
	unit: 'DOT',
}

beforeEach(() => {
	vi.resetAllMocks()
	node.syncing = true
	node.overviews = new Map([
		[
			'validator',
			{
				own: 25000000000n,
				total: 12345678901234567890n,
				nominatorCount: 500,
				pageCount: 2,
			},
		],
	])
})

test('detailed summaries show overview status and total stake while paged exposures and account checks are pending', () => {
	const result = useValidatorSummaryData(props)
	expect(result.validatorStatus).toBe('active')
	expect(result.statusLabel).toBe('listItemActive')
	expect(result.totalStake).toBe('1,234,567,890')
	expect(getValidatorTotalStake).not.toHaveBeenCalled()
	expect(getActiveValidator).not.toHaveBeenCalled()
})

test('summaries keep loading until overviews arrive even if global sync has finished', () => {
	node.syncing = false
	node.overviews = undefined
	const result = useValidatorSummaryData({ ...props, status: 'active' })
	expect(result.statusLabel).toBe('syncing')
	expect(result.validatorStatus).toBe('waiting')
	expect(result.totalStake).toBeUndefined()
})

test('an address absent from a completed overview is waiting even with a stale active status', () => {
	node.overviews = new Map()
	const result = useValidatorSummaryData({ ...props, status: 'active' })
	expect(result.statusLabel).toBe('Waiting')
	expect(result.validatorStatus).toBe('waiting')
	expect(result.totalStake).toBeUndefined()
})

test('active zero stake remains distinct from missing overview data', () => {
	node.overviews!.get('validator')!.total = 0n
	const result = useValidatorSummaryData(props)
	expect(result.validatorStatus).toBe('active')
	expect(result.totalStake).toBe('0')
})

test('API backing stake and status override node totals', () => {
	const result = useValidatorSummaryData({
		...props,
		statusActive: true,
		statusLabel: 'backing',
		statusValue: stringToBn('12.5'),
	})
	expect(result.statusLabel).toBe('backing')
	expect(result.totalStake).toBe('12.5')
})

test.each([undefined, stringToBn('0')])(
	'empty API stake (%s) does not fall back to node totals',
	(statusValue) => {
		const result = useValidatorSummaryData({
			...props,
			statusActive: false,
			statusLabel: 'waiting',
			statusValue,
		})
		expect(result.statusLabel).toBe('waiting')
		expect(result.totalStake).toBeUndefined()
		expect(getValidatorTotalStake).not.toHaveBeenCalled()
	},
)

test('self stake uses the overview before paged nominators load', () => {
	const result = useValidatorSelfStake('validator', 10)
	expect(result.selfStake?.toFixed()).toBe('2.5')
	expect(result.selfStakeMax).toBe(false)
	expect(getActiveValidator).not.toHaveBeenCalled()
})

test('missing overviews do not reuse self stake from older exposures', () => {
	node.overviews = undefined
	getActiveValidator.mockReturnValue({ own: 25000000000n })
	expect(useValidatorSelfStake('validator', 10).selfStake).toBeUndefined()
	expect(getActiveValidator).not.toHaveBeenCalled()
})
