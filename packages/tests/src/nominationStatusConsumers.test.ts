// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Staker, StakingLedger } from 'types'
import { beforeEach, expect, test, vi } from 'vitest'
import {
	createElement,
	type ReactNode,
} from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { Stats } from '../../app-staking/src/canvas/Pool/Overview/Stats'
import { useNominationStatus } from '../../app-staking/src/hooks/useNominationStatus'
import { PoolStatus } from '../../app-staking/src/pages/Pools/Status/PoolStatus'

const { gated, eraBacking, state } = vi.hoisted(() => ({
	gated: vi.fn(),
	eraBacking: vi.fn(),
	state: {
		nominators: undefined as StakingLedger['nominators'],
		isNominator: false,
		isValidator: false,
		syncing: false,
		stakers: [] as Staker[],
	},
}))

vi.mock('../../data-gate/src/index', () => ({
	useNominationStatus: gated,
	useHasEraBacking: eraBacking,
}))
vi.mock('../../hooks/src/useBalances', () => ({
	useBalances: () => ({
		getNominations: () => state.nominators?.targets ?? [],
		getStakingLedger: () => ({ nominators: state.nominators }),
	}),
}))
vi.mock('../../hooks/src/useStaking', () => ({
	useStaking: () => ({ isNominator: state.isNominator }),
}))
vi.mock('../../hooks/src/useValidators', () => ({
	useValidators: () => ({ isValidator: () => state.isValidator }),
}))
vi.mock('../../hooks/src/useActivePool', () => ({
	useActivePool: () => ({
		activePool: {
			addresses: { stash: 'pool-stash' },
			bondedPool: { state: 'Open' },
		},
		activePoolNominations: state.nominators,
	}),
}))
vi.mock('../../hooks/src/useSyncing', () => ({
	useSyncing: () => ({ syncing: state.syncing }),
}))
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({ isReady: false }),
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../consts/src/util', () => ({
	getStakingChainData: () => ({ unit: 'DOT', units: 10 }),
}))
vi.mock('../../assets/src/index', () => ({
	getChainIcons: () => ({ token: () => null }),
}))
vi.mock('library/Stat', () => ({ Stat: () => null }))
vi.mock('../../ui-core/src/canvas/index.tsx', () => ({
	Stat: ({ children }: { children: ReactNode }) =>
		createElement('span', null, children),
	Subheading: ({ children }: { children: ReactNode }) =>
		createElement('div', null, children),
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({ t: (key: string) => key }),
	}),
)

beforeEach(() => {
	vi.resetAllMocks()
	state.nominators = undefined
	state.isNominator = false
	state.isValidator = false
	state.syncing = false
	state.stakers = []
	eraBacking.mockImplementation(() => ({
		data: state.stakers.some(({ others }) =>
			others.some(({ who }) => who === 'pool-stash'),
		),
	}))
	gated.mockReturnValue({
		status: undefined,
		loading: false,
		error: null,
		refetch: vi.fn(),
	})
})

test('confirmed non-nominators skip status requests and keep their known role on errors', () => {
	state.nominators = { targets: [], submittedIn: 0 }
	gated.mockReturnValue({
		status: undefined,
		loading: false,
		error: new Error('offline'),
	})
	expect(useNominationStatus('stash').message).toBe('notNominating')
	expect(gated).toHaveBeenCalledWith(null, { dependencies: [state.nominators] })
})

test('unknown nominations do not prevent an early status request', () => {
	gated.mockReturnValue({ status: undefined, loading: true, error: null })
	expect(useNominationStatus('stash').message).toBe('syncing')
	expect(gated).toHaveBeenCalledWith('stash', { dependencies: [undefined] })
})

test('validators skip nomination-status requests', () => {
	state.isValidator = true
	expect(useNominationStatus('stash').message).toBe('youAreValidator')
	expect(gated).toHaveBeenCalledWith(null, { dependencies: [undefined] })
})

test('nominators pass changed nomination data through to the gate and retain refetch', () => {
	state.isNominator = true
	state.nominators = { targets: ['validator'], submittedIn: 99 }
	const refetch = vi.fn()
	gated.mockReturnValue({
		status: 'active',
		loading: false,
		error: null,
		refetch,
	})
	expect(useNominationStatus('stash').refetch).toBe(refetch)
	expect(gated).toHaveBeenLastCalledWith('stash', {
		dependencies: [state.nominators],
	})
	state.nominators = { targets: ['new-validator'], submittedIn: 100 }
	useNominationStatus('stash')
	expect(gated).toHaveBeenLastCalledWith('stash', {
		dependencies: [state.nominators],
	})
})

test('pool status passes changed nominations through and skips confirmed empty sets', () => {
	state.nominators = { targets: ['validator'], submittedIn: 99 }
	PoolStatus()
	expect(gated).toHaveBeenLastCalledWith('pool-stash', {
		dependencies: [state.nominators],
	})
	state.nominators = { targets: ['new-validator'], submittedIn: 100 }
	PoolStatus()
	expect(gated).toHaveBeenLastCalledWith('pool-stash', {
		dependencies: [state.nominators],
	})
	state.nominators = { targets: [], submittedIn: 0 }
	PoolStatus()
	expect(gated).toHaveBeenLastCalledWith(null, {
		dependencies: [state.nominators],
	})
})

test('pool activity uses era backing even when the current nomination set has changed', () => {
	state.nominators = { targets: ['new-validator'], submittedIn: 100 }
	state.stakers = [
		{
			address: 'previous-validator',
			own: '0',
			total: '10',
			others: [{ who: 'pool-stash', value: '10' }],
		},
	]
	const props = {
		bondedPool: {
			id: 1,
			addresses: { stash: 'pool-stash' },
			points: 10n,
			memberCounter: 1,
		},
	} as Parameters<typeof Stats>[0]
	expect(renderToStaticMarkup(createElement(Stats, props))).toContain(
		'activelyNominating',
	)
	expect(eraBacking).toHaveBeenCalledWith('pool-stash')
	expect(gated).not.toHaveBeenCalled()

	state.stakers = []
	expect(renderToStaticMarkup(createElement(Stats, props))).not.toContain(
		'activelyNominating',
	)
})
