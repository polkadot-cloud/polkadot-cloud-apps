// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { beforeEach, expect, test, vi } from 'vitest'
import { Headers } from '../../app-nominate/src/Headers'
import {
	createElement,
	type ReactNode,
} from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'

const { state, chat } = vi.hoisted(() => ({
	state: {
		activeAddress: 'account' as string | null,
		ledgers: {} as Record<string, { nominators?: { targets: string[] } }>,
		activePool: undefined as { nominators: { targets: string[] } } | undefined,
		owner: false,
	},
	chat: vi.fn((_props: { currentNominations?: string[] }) => null),
}))

vi.mock(
	'../../app-nominate/node_modules/@polkadot-cloud/connect/index.js',
	() => ({ useActiveAccount: () => ({ activeAddress: state.activeAddress }) }),
)
vi.mock('../../hooks/src/useBalances', () => ({
	useBalances: () => ({
		getStakingLedger: (address: string) => state.ledgers[address] ?? {},
	}),
}))
vi.mock('../../hooks/src/useActivePool', () => ({
	useActivePool: () => ({
		activePool: state.activePool,
		isOwner: () => state.owner,
	}),
}))
vi.mock('../../hooks/src/useUi', () => ({
	useUi: () => ({ sideMenuMinimised: false }),
}))
vi.mock('library/ManageNominations/NominationHealthSetting', () => ({
	NominationHealthSetting: () => null,
}))
vi.mock('library/Sync', () => ({ Sync: () => null }))
vi.mock('../../ui-app/src/Headers', () => ({
	Account: () => null,
	Settings: () => null,
}))
vi.mock('../../ui-core/src/base', () => ({
	Header: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('../../ui-chat/src/index.tsx', () => ({ Chat: chat }))

beforeEach(() => {
	vi.clearAllMocks()
	state.activeAddress = 'account'
	state.ledgers = {}
	state.activePool = undefined
	state.owner = false
})

const currentNominations = () => {
	renderToStaticMarkup(createElement(Headers))
	expect(chat).toHaveBeenCalled()
	return chat.mock.calls.at(-1)?.[0].currentNominations
}

test('chat receives personal nominations as they sync and follows account changes', () => {
	expect(currentNominations()).toBeUndefined()
	state.ledgers.account = { nominators: { targets: ['validator-a'] } }
	expect(currentNominations()).toEqual(['validator-a'])
	state.activeAddress = 'other-account'
	expect(currentNominations()).toBeUndefined()
	state.ledgers['other-account'] = {
		nominators: { targets: ['validator-b'] },
	}
	expect(currentNominations()).toEqual(['validator-b'])
})

test('a pool owner shares pool nominations without needing a personal staking ledger', () => {
	state.owner = true
	expect(currentNominations()).toBeUndefined()
	state.activePool = { nominators: { targets: ['pool-validator'] } }
	expect(currentNominations()).toEqual(['pool-validator'])
	state.ledgers.account = { nominators: { targets: ['personal-validator'] } }
	expect(currentNominations()).toEqual(['pool-validator'])
})

test('pool members do not share pool nominations they cannot manage in Nominate', () => {
	state.activePool = { nominators: { targets: ['pool-validator'] } }
	expect(currentNominations()).toBeUndefined()
	state.ledgers.account = { nominators: { targets: ['personal-validator'] } }
	expect(currentNominations()).toEqual(['personal-validator'])
})

test('confirmed empty nomination sets remain distinct from unavailable data', () => {
	state.ledgers.account = { nominators: { targets: [] } }
	expect(currentNominations()).toEqual([])
	state.ledgers = {}
	state.owner = true
	state.activePool = { nominators: { targets: [] } }
	expect(currentNominations()).toEqual([])
})

test('disconnecting stops sharing nominations even while old pool data is present', () => {
	state.activeAddress = null
	state.activePool = { nominators: { targets: ['pool-validator'] } }
	state.owner = true
	expect(currentNominations()).toBeUndefined()
})
