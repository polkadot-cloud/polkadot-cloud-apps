// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { BondedPool } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import {
	act,
	createElement,
	type ReactNode,
} from '../../app-staking/node_modules/react/index.js'
import {
	createRoot,
	type Root,
} from '../../app-staking/node_modules/react-dom/client.js'
import { MembersList } from '../../app-staking/src/canvas/PoolMembers/Lists/FetchPage'
import type { FetchedPoolMember } from '../../hooks/src/usePoolMembers'
import type { PoolMembersData } from '../../plugin-staking-api/src/types'

const { dom, state, fetchMembers, nodeRead } = await vi.hoisted(async () => {
	const { JSDOM } = await import('jsdom')
	const dom = new JSDOM('<!doctype html><html><body></body></html>')
	vi.stubGlobal('window', dom.window)
	vi.stubGlobal('document', dom.window.document)
	return {
		dom,
		state: { network: 'polkadot' },
		fetchMembers: vi.fn(),
		nodeRead: vi.fn(() => {
			throw new Error('Unexpected node read')
		}),
	}
})
vi.mock('../../plugin-staking-api/src/index', () => ({
	fetchPoolMembers: fetchMembers,
}))
vi.mock('../../hooks/src/useNetwork', () => ({ useNetwork: () => state }))
vi.mock('../../hooks/src/useApi', () => ({ useApi: nodeRead }))
vi.mock('contexts/List', () => ({
	ListProvider: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('library/List', () => ({
	List: ({ children }: { children: ReactNode }) => children,
	Wrapper: ({ children }: { children: ReactNode }) => children,
	ListStatusHeader: ({ children }: { children: ReactNode }) =>
		createElement('div', null, children),
}))
vi.mock('library/List/MotionContainer', () => ({
	MotionContainer: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('library/List/Pagination', () => ({
	Pagination: ({
		page,
		total,
		setter,
		disabled,
	}: {
		page: number
		total: number
		setter: (page: number) => void
		disabled: boolean
	}) =>
		createElement(
			'div',
			null,
			createElement('span', { 'data-page': true }, `${page}/${total}`),
			createElement(
				'button',
				{
					type: 'button',
					'data-next': true,
					disabled: disabled || page >= total,
					onClick: () => setter(page + 1),
				},
				'Next',
			),
		),
}))
vi.mock('../../app-staking/src/canvas/PoolMembers/Lists/Member', () => ({
	Member: ({ member }: { member: FetchedPoolMember }) =>
		createElement(
			'div',
			{
				'data-member': member.address,
				'data-points-type': typeof member.points,
				'data-points': member.points.toString(),
				'data-unbonding': member.unbondingEras
					.map(([era, amount]) => `${era}:${typeof amount}:${amount}`)
					.join(','),
				'data-permission': member.claimPermission ?? 'unknown',
			},
			member.address,
		),
}))
vi.mock('../../ui-buttons/src/index', () => ({
	ButtonSecondary: ({
		text,
		onClick,
		disabled,
	}: {
		text: string
		onClick: () => void
		disabled: boolean
	}) =>
		createElement(
			'button',
			{ type: 'button', 'data-retry': true, onClick, disabled },
			text,
		),
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({ t: (key: string) => key }),
	}),
)

const response = (
	address: string,
	totalMembers = 51,
	poolId = 7,
): PoolMembersData => ({
	poolMembers: {
		poolId,
		totalMembers,
		members: [
			{
				poolId,
				address,
				points: '900719925474099312345',
				unbondingEras: [{ era: 50, amount: '900719925474099312346' }],
				claimPermission: 'PermissionlessCompound',
			},
		],
	},
})
const deferred = () => {
	let resolve!: (result: PoolMembersData) => void
	const promise = new Promise<PoolMembersData>((done) => {
		resolve = done
	})
	return { promise, resolve }
}
let root: Root
let container: HTMLDivElement
let client: QueryClient
const render = async (poolId = 7) => {
	await act(async () =>
		root.render(
			createElement(
				QueryClientProvider,
				{ client },
				createElement(MembersList, {
					bondedPool: { id: poolId, memberCounter: 999 } as BondedPool,
					pagination: true,
					itemsPerPage: 50,
					isDepositor: false,
					isOwner: false,
					isRoot: false,
					isBouncer: false,
				}),
			),
		),
	)
}
const flush = async () => {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 5))
	})
}
const click = async (selector: string) => {
	await act(async () =>
		container.querySelector<HTMLButtonElement>(selector)!.click(),
	)
	await flush()
}

beforeEach(() => {
	vi.clearAllMocks()
	fetchMembers.mockReset()
	state.network = 'polkadot'
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.stubGlobal('window', dom.window)
	vi.stubGlobal('document', dom.window.document)
	client = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: 0 } },
	})
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})
afterEach(async () => {
	await act(async () => root.unmount())
	client.clear()
	container.remove()
	vi.unstubAllGlobals()
})

test('renders normalized members immediately after the sole API request and uses its member count', async () => {
	const pending = deferred()
	fetchMembers.mockReturnValue(pending.promise)
	await render()
	expect(container.textContent).toContain('fetchingMemberList')
	expect(container.querySelector('[data-member]')).toBeNull()
	await act(async () => pending.resolve(response('alice')))
	await flush()
	const member = container.querySelector('[data-member="alice"]')!
	expect(member.getAttribute('data-points-type')).toBe('bigint')
	expect(member.getAttribute('data-points')).toBe('900719925474099312345')
	expect(member.getAttribute('data-unbonding')).toBe(
		'50:bigint:900719925474099312346',
	)
	expect(member.getAttribute('data-permission')).toBe('PermissionlessCompound')
	expect(container.textContent).not.toContain('fetchingMemberList')
	expect(container.querySelector('[data-page]')?.textContent).toBe('1/2')
	expect(fetchMembers).toHaveBeenCalledExactlyOnceWith(
		'polkadot',
		7,
		50,
		0,
		expect.any(AbortSignal),
	)
	expect(nodeRead).not.toHaveBeenCalled()
})

test('changing pages uses the correct offset and clears rows until the new page arrives', async () => {
	const second = deferred()
	fetchMembers
		.mockResolvedValueOnce(response('first'))
		.mockReturnValueOnce(second.promise)
	await render()
	await flush()
	await click('[data-next]')
	expect(container.querySelector('[data-member]')).toBeNull()
	expect(container.textContent).toContain('fetchingMemberList')
	expect(fetchMembers).toHaveBeenLastCalledWith(
		'polkadot',
		7,
		50,
		50,
		expect.any(AbortSignal),
	)
	await act(async () => second.resolve(response('second')))
	await flush()
	expect(container.querySelector('[data-member="second"]')).not.toBeNull()
	expect(container.querySelector('[data-page]')?.textContent).toBe('2/2')
})

test('network and pool switches reset pagination, cancel pending work, and ignore late responses', async () => {
	const stale = deferred()
	fetchMembers
		.mockResolvedValueOnce(response('first'))
		.mockReturnValueOnce(stale.promise)
	await render()
	await flush()
	await click('[data-next]')
	const oldSignal = fetchMembers.mock.calls[1][4] as AbortSignal
	state.network = 'kusama'
	fetchMembers.mockResolvedValueOnce(response('new-network'))
	await render()
	await flush()
	expect(oldSignal.aborted).toBe(true)
	expect(fetchMembers).toHaveBeenLastCalledWith(
		'kusama',
		7,
		50,
		0,
		expect.any(AbortSignal),
	)
	await act(async () => stale.resolve(response('stale')))
	await flush()
	expect(container.querySelector('[data-member="new-network"]')).not.toBeNull()
	expect(container.querySelector('[data-member="stale"]')).toBeNull()
	fetchMembers.mockResolvedValueOnce(response('new-pool', 1, 8))
	await render(8)
	await flush()
	expect(fetchMembers).toHaveBeenLastCalledWith(
		'kusama',
		8,
		50,
		0,
		expect.any(AbortSignal),
	)
	expect(container.querySelector('[data-member="new-pool"]')).not.toBeNull()
})

test('failed requests show a retry action and successful empty results do not stay loading', async () => {
	fetchMembers.mockRejectedValueOnce(new Error('offline'))
	await render()
	await flush()
	expect(container.textContent).toContain('errorUnknown')
	expect(container.textContent).not.toContain('fetchingMemberList')
	fetchMembers.mockResolvedValueOnce({
		poolMembers: { poolId: 7, totalMembers: 0, members: [] },
	})
	await click('[data-retry]')
	expect(container.textContent).not.toContain('errorUnknown')
	expect(container.textContent).not.toContain('fetchingMemberList')
	expect(container.querySelector('[data-page]')?.textContent).toBe('1/1')
	expect(
		container.querySelector<HTMLButtonElement>('[data-next]')?.disabled,
	).toBe(true)
})

test('zero balances and unknown permissions remain zero and unknown', async () => {
	const data = response('zero')
	data.poolMembers.members[0] = {
		...data.poolMembers.members[0],
		points: '0',
		unbondingEras: [],
		claimPermission: null,
	}
	fetchMembers.mockResolvedValueOnce(data)
	await render()
	await flush()
	const member = container.querySelector('[data-member="zero"]')!
	expect(member.getAttribute('data-points')).toBe('0')
	expect(member.getAttribute('data-points-type')).toBe('bigint')
	expect(member.getAttribute('data-unbonding')).toBe('')
	expect(member.getAttribute('data-permission')).toBe('unknown')
})

test('returns to a valid page when the API member count shrinks', async () => {
	fetchMembers
		.mockResolvedValueOnce(response('first'))
		.mockResolvedValueOnce({
			poolMembers: { poolId: 7, totalMembers: 50, members: [] },
		})
		.mockResolvedValueOnce(response('remaining', 50))
	await render()
	await flush()
	await click('[data-next]')
	await flush()
	expect(fetchMembers).toHaveBeenLastCalledWith(
		'polkadot',
		7,
		50,
		0,
		expect.any(AbortSignal),
	)
	expect(container.querySelector('[data-page]')?.textContent).toBe('1/1')
	expect(container.querySelector('[data-member="remaining"]')).not.toBeNull()
})
