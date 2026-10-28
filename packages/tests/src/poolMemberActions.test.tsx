// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { act, createElement, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import type { BondedPool } from 'types'
import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Members } from '../../app-staking/src/canvas/PoolMembers/Members'
import { WithdrawMember } from '../../app-staking/src/canvas/PoolMembers/Prompts/WithdrawMember'
import type { FetchedPoolMember } from '../../hooks/src/usePoolMembers'

const {
	dom,
	state,
	openMenu,
	openPromptWith,
	poolWithdraw,
	submit,
	translate,
} = await vi.hoisted(async () => {
	const { JSDOM } = await import('jsdom')
	const dom = new JSDOM('<!doctype html><html><body></body></html>')
	vi.stubGlobal('window', dom.window)
	vi.stubGlobal('document', dom.window.document)
	return {
		dom,
		state: {
			activeAddress: 'depositor',
			activeEra: 100,
			members: [] as FetchedPoolMember[],
		},
		openMenu: vi.fn(),
		openPromptWith: vi.fn(),
		poolWithdraw: vi.fn(() => 'withdraw-transaction'),
		submit: vi.fn(() => ({ proxySupported: false })),
		translate: vi.fn((key: string) => key),
	}
})

const passthrough = vi.hoisted(
	() =>
		({ children }: { children: ReactNode }) =>
			children,
)

vi.mock(
	'../../app-staking/node_modules/@polkadot-cloud/connect/index.js',
	() => ({
		useActiveAccount: () => ({
			activeAddress: state.activeAddress,
			activeAccount: { address: state.activeAddress },
		}),
	}),
)
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({
		activeEra: { index: state.activeEra },
		serviceApi: { tx: { poolWithdraw } },
		getConsts: () => ({ historyDepth: 84 }),
	}),
}))
vi.mock('../../hooks/src/useMenu', () => ({
	useMenu: () => ({ open: false, openMenu }),
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/useThemeValues', () => ({
	useThemeValues: () => ({ getThemeValue: () => '' }),
}))
vi.mock('../../hooks/src/useActiveProxy', () => ({
	useActiveProxy: () => ({ activeProxy: null }),
}))
vi.mock('../../hooks/src/usePoolMembers', () => ({
	usePoolMembers: () => ({
		data: { members: state.members, totalMembers: state.members.length },
		isPending: false,
	}),
}))
vi.mock('hooks/useSignerWarnings', () => ({
	useSignerWarnings: () => ({ getSignerWarnings: () => [] }),
}))
vi.mock('../../consts/src/util', () => ({
	getStakingChainData: () => ({ unit: 'DOT', units: 10 }),
}))
vi.mock('../../tx-submit/src/useSubmitExtrinsic', () => ({
	useSubmitExtrinsic: submit,
}))
vi.mock('../../tx-submit/src/util', () => ({ formatFromProp: () => null }))
vi.mock('../../ui-overlay/src/index', () => ({
	usePrompt: () => ({ openPromptWith, closePrompt: vi.fn() }),
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({ useTranslation: () => ({ t: translate }) }),
)
vi.mock('contexts/List', () => ({ ListProvider: passthrough }))
vi.mock('library/List', () => ({
	List: passthrough,
	Wrapper: passthrough,
	ListStatusHeader: passthrough,
}))
vi.mock('library/List/MotionContainer', () => ({
	MotionContainer: passthrough,
}))
vi.mock('library/List/Pagination', () => ({ Pagination: () => null }))
vi.mock('library/ListItem/Labels/Identity', () => ({ Identity: () => null }))
vi.mock('library/ListItem/Labels/ClaimPermission', () => ({
	ClaimPermission: () => null,
}))
vi.mock('library/ListItem/Labels/PoolMemberBonded', () => ({
	PoolMemberBonded: () => null,
}))
vi.mock('library/Form/Warning', () => ({ Warning: () => null }))
vi.mock(
	'../../app-staking/src/canvas/PoolMembers/Prompts/UnbondMember',
	() => ({
		UnbondMember: () => null,
	}),
)
vi.mock('../../ui-app/src/Card', () => ({ CardWrapper: passthrough }))
vi.mock('../../ui-app/src/ListItem', () => ({
	BasicItem: { Root: passthrough, Row: passthrough },
}))
vi.mock('../../ui-app/src/Menu', () => ({ MenuList: () => null }))
vi.mock('../../ui-app/src/SubmitTx', () => ({ SubmitTx: () => null }))
vi.mock('../../ui-buttons/src/index', () => ({ ButtonSecondary: () => null }))
vi.mock('../../ui-core/src/list', () => ({
	HeaderButtonRow: passthrough,
	LabelRow: passthrough,
	Separator: () => null,
}))
vi.mock('../../ui-core/src/modal', () => ({
	Notes: passthrough,
	Padding: passthrough,
	Warnings: passthrough,
}))
vi.mock('../../ui-core/src/prompt', () => ({ Title: () => null }))

const member = (
	unbondingEras: FetchedPoolMember['unbondingEras'] = [[100, 10000000000n]],
	address = 'member',
): FetchedPoolMember => ({
	poolId: 7,
	address,
	points: 10000000000n,
	unbondingEras,
	claimPermission: null,
})
const bondedPool = (state: BondedPool['state']): BondedPool =>
	({
		id: 7,
		state,
		memberCounter: 2,
		roles: { depositor: 'depositor', root: 'root', bouncer: 'bouncer' },
	}) as BondedPool

let root: Root
let container: HTMLDivElement

beforeEach(() => {
	vi.clearAllMocks()
	state.activeAddress = 'depositor'
	state.activeEra = 100
	state.members = [member()]
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.stubGlobal('window', dom.window)
	vi.stubGlobal('document', dom.window.document)
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})
afterEach(async () => {
	await act(async () => root.unmount())
	container.remove()
	vi.unstubAllGlobals()
})
afterAll(() => dom.window.close())

const menu = async (poolState: BondedPool['state'] = 'Destroying') => {
	await act(async () =>
		root.render(createElement(Members, { bondedPool: bondedPool(poolState) })),
	)
	await act(async () => container.querySelector('button')!.click())
	return openMenu.mock.lastCall![1].props.items as {
		title: string
		cb: () => void
	}[]
}

test.each(['depositor', 'unrelated'])(
	'%s can unbond and withdraw another member in a destroying pool',
	async (caller) => {
		state.activeAddress = caller
		state.activeEra = 101
		expect((await menu()).map(({ title }) => title)).toEqual([
			'copyAddress',
			'unbondFunds',
			'withdrawFunds',
		])
	},
)

test.each(['depositor', 'unrelated'])(
	'%s does not get ordinary member management actions for the depositor row',
	async (caller) => {
		state.activeAddress = caller
		state.activeEra = 101
		state.members = [member(undefined, 'depositor')]
		expect((await menu()).map(({ title }) => title)).toEqual(['copyAddress'])
	},
)

test.each([
	[99, false],
	[100, true],
	[101, true],
])(
	'funds unlocking in era 100: withdrawal at era %s is %s',
	async (era, visible) => {
		state.activeAddress = 'unrelated'
		state.activeEra = era
		state.members[0].points = 0n
		const items = await menu()
		expect(items.some(({ title }) => title === 'withdrawFunds')).toBe(visible)
		expect(items.some(({ title }) => title === 'unbondFunds')).toBe(false)
		if (visible) {
			items.find(({ title }) => title === 'withdrawFunds')!.cb()
			expect(openPromptWith.mock.lastCall![0].props.who).toBe('member')
		}
	},
)

test.each([
	['Blocked', 'root', true],
	['Blocked', 'bouncer', true],
	['Blocked', 'unrelated', false],
	['Open', 'root', false],
] as const)(
	'%s pool withdrawal for %s remains %s',
	async (poolState, caller, visible) => {
		state.activeAddress = caller
		state.activeEra = 101
		expect(
			(await menu(poolState)).some(({ title }) => title === 'withdrawFunds'),
		).toBe(visible)
	},
)

test.each([
	{ chunks: [[100, 10000000000n]], amount: '1', valid: true },
	{
		chunks: [
			[99, 10000000000n],
			[100, 20000000000n],
			[101, 40000000000n],
		],
		amount: '3',
		valid: true,
	},
	{ chunks: [[101, 40000000000n]], amount: '0', valid: false },
	{ chunks: [], amount: '0', valid: false },
])(
	'withdrawal prompt calculates $amount DOT and submit validity $valid',
	({ chunks, amount, valid }) => {
		renderToStaticMarkup(
			createElement(WithdrawMember, {
				who: 'member',
				member: member(chunks as FetchedPoolMember['unbondingEras']),
				memberRef: { current: null },
			}),
		)
		expect(translate).toHaveBeenCalledWith('amountWillBeWithdrawn', {
			bond: amount,
			unit: 'DOT',
		})
		expect(submit).toHaveBeenLastCalledWith(
			expect.objectContaining({ shouldSubmit: valid }),
		)
		if (valid) {
			expect(poolWithdraw).toHaveBeenCalledWith('member', 84)
		} else {
			expect(poolWithdraw).not.toHaveBeenCalled()
		}
	},
)
