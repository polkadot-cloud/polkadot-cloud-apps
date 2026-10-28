// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SyncConfig, SyncId } from 'types'
import { beforeEach, expect, test, vi } from 'vitest'
import { createElement } from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { useStandaloneAccount } from '../../app-staking/src/pages/Nominate/useStandaloneAccount'

const { state } = vi.hoisted(() => ({
	state: {
		activeAddress: 'nominator' as string | null,
		syncIds: [] as SyncId[],
		balanceSynced: true,
		membershipSynced: true,
		inPool: false,
		poolLoaded: false,
		validatorLoading: false,
	},
}))

vi.mock(
	'../../app-staking/node_modules/@polkadot-cloud/connect/index.js',
	() => ({
		useActiveAccount: () => ({ activeAddress: state.activeAddress }),
		useImportedAccounts: () => ({ accountsInitialised: true }),
	}),
)
vi.mock('../../hooks/src/useActivePool', () => ({
	useActivePool: () => ({ isOwner: () => false }),
}))
vi.mock('../../hooks/src/useStaking', () => ({
	useStaking: () => ({ isBonding: true, isNominator: true }),
}))
vi.mock('../../hooks/src/useValidators', () => ({
	useValidators: () => ({
		isValidator: () => false,
		isLoading: () => state.validatorLoading,
	}),
}))
vi.mock('../../hooks/src/useBalances', () => ({
	useBalances: () => ({
		getAccountBalance: () => ({ synced: state.balanceSynced }),
		getPoolMembership: () => ({
			synced: state.membershipSynced,
			membership: state.inPool ? { poolId: 1 } : undefined,
		}),
	}),
}))
vi.mock('../../global-bus/src/index', () => ({
	getActivePool: () => (state.poolLoaded ? { id: 1 } : undefined),
	getSyncIds: (config: SyncConfig) =>
		state.syncIds.filter((id) => config === '*' || config.includes(id)),
}))

const readAccount = () => {
	let account: ReturnType<typeof useStandaloneAccount> | undefined
	const Probe = () => {
		account = useStandaloneAccount()
		return null
	}
	renderToStaticMarkup(createElement(Probe))
	return account!
}

beforeEach(() => {
	state.activeAddress = 'nominator'
	state.syncIds = []
	state.balanceSynced = true
	state.membershipSynced = true
	state.inPool = false
	state.poolLoaded = false
	state.validatorLoading = false
})

test.each<SyncId>(['initialization', 'staking-ledgers'])(
	'eligibility waits for %s to finish',
	(id) => {
		state.syncIds = [id]
		expect(readAccount().eligibilityLoading).toBe(true)
		state.syncIds = []
		expect(readAccount().eligibilityLoading).toBe(false)
	},
)

test('unrelated global sync tasks do not block a ready nominator', () => {
	state.syncIds = [
		'era-stakers',
		'bonded-pools',
		'active-pools',
		'active-proxy',
	]
	expect(readAccount()).toMatchObject({
		eligibilityLoading: false,
		canManageNominations: true,
		activelyNominating: true,
	})
})

test.each(['balanceSynced', 'membershipSynced'] as const)(
	'eligibility waits for account data when %s is false',
	(field) => {
		state[field] = false
		expect(readAccount().eligibilityLoading).toBe(true)
	},
)

test('pool members wait for their active pool data', () => {
	state.inPool = true
	expect(readAccount().eligibilityLoading).toBe(true)
	state.poolLoaded = true
	expect(readAccount().eligibilityLoading).toBe(false)
})

test('eligibility waits for validator status', () => {
	state.validatorLoading = true
	expect(readAccount().eligibilityLoading).toBe(true)
})

test('disconnected accounts do not stay in eligibility loading', () => {
	state.activeAddress = null
	state.syncIds = ['initialization', 'staking-ledgers']
	expect(readAccount()).toMatchObject({
		eligibilityLoading: false,
		canManageNominations: false,
	})
})
