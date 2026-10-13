// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import {
	act,
	type ChangeEvent,
	createElement,
	type FocusEventHandler,
} from '../../app-staking/node_modules/react/index.js'
import {
	createRoot,
	type Root,
} from '../../app-staking/node_modules/react-dom/client.js'
import { RewardCalculator } from '../../app-staking/src/modals/RewardCalculator'

const { state, dom } = await vi.hoisted(async () => {
	const { JSDOM } = await import('jsdom')
	const dom = new JSDOM('<!doctype html><html><body></body></html>')
	vi.stubGlobal('window', dom.window)
	vi.stubGlobal('document', dom.window.document)
	return {
		dom,
		state: {
			accountIsValidator: true,
			annualReward: 3650,
			currentStake: 100000000000000n,
			minValidatorBond: 0n,
			loading: false,
			unavailable: false,
		},
	}
})
vi.mock(
	'../../app-staking/node_modules/@polkadot-cloud/connect/index.js',
	() => ({
		useActiveAccount: () => ({ activeAddress: 'validator' }),
	}),
)
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/useAccountBalances', () => ({
	useAccountBalances: () => ({
		balances: { nominator: { active: state.currentStake } },
	}),
}))
vi.mock('../../hooks/src/useStakingMetrics', () => ({
	useStakingMetrics: () => ({ minValidatorBond: state.minValidatorBond }),
}))
vi.mock('hooks/useAverageRewardRate', () => ({
	useAverageRewardRate: () => ({ getAverageRewardRate: () => 10 }),
}))
vi.mock('hooks/useValidatorRewardProjection', () => ({
	useValidatorRewardProjection: () => state,
}))
vi.mock('../../assets/src/index', () => ({
	getChainIcons: () => ({ token: () => null }),
}))
vi.mock('../../consts/src/util', () => ({
	getStakingChainData: () => ({ unit: 'DOT', units: 10 }),
}))
vi.mock('../../ui-overlay/src/index', () => ({
	useOverlay: () => ({ modal: { config: { options: { currency: 'USD' } } } }),
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({
			t: (key: string, options?: { minBondUnit: string; unit: string }) =>
				key === 'minimumBond'
					? `A minimum bond of ${options?.minBondUnit} ${options?.unit} is required`
					: key,
		}),
	}),
)
vi.mock('library/Balance', () => ({
	Balance: {
		WithFiat: ({ value, currency }: { value: number; currency: string }) =>
			createElement('span', {
				'data-reward': value,
				'data-currency': currency,
			}),
	},
}))
vi.mock('../../ui-app/src/ModalTitle', () => ({ ModalTitle: () => null }))
vi.mock('../../ui-core/src/base', () => ({
	CardHeader: 'section',
	Separator: () => null,
}))
vi.mock('../../ui-core/src/modal', () => ({ Padding: 'div' }))
vi.mock('../../ui-core/src/input', () => ({
	TokenInput: ({
		value,
		onChange,
		onBlur,
	}: {
		value: string
		onChange: (event: ChangeEvent<HTMLInputElement>) => void
		onBlur?: FocusEventHandler<HTMLInputElement>
	}) =>
		createElement('input', {
			value,
			onChange,
			onBlur,
			'aria-label': 'DOT Amount',
		}),
}))
vi.mock('../../app-staking/src/modals/Networks/Wrapper', () => ({
	ContentWrapper: 'div',
}))

let container: HTMLDivElement
let root: Root

beforeEach(async () => {
	Object.assign(state, {
		accountIsValidator: true,
		annualReward: 3650,
		currentStake: 100000000000000n,
		minValidatorBond: 0n,
		loading: false,
		unavailable: false,
	})
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.stubGlobal('window', dom.window)
	vi.stubGlobal('document', dom.window.document)
	vi.stubGlobal('HTMLInputElement', dom.window.HTMLInputElement)
	vi.stubGlobal('Event', dom.window.Event)
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

const render = async () =>
	act(async () => root.render(createElement(RewardCalculator)))
const rewards = () =>
	[...container.querySelectorAll('[data-reward]')].map((node) =>
		Number(node.getAttribute('data-reward')),
	)
const input = () => container.querySelector('input')!
const changeAmount = async (value: string) =>
	act(async () => {
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			'value',
		)!.set!.call(input(), value)
		input().dispatchEvent(new Event('input', { bubbles: true }))
	})
const blurAmount = async () =>
	act(async () =>
		input().dispatchEvent(new Event('focusout', { bubbles: true })),
	)

test('calculator shows syncing before the saved account is identified and until its rewards are ready', async () => {
	Object.assign(state, {
		accountIsValidator: false,
		annualReward: 0,
		currentStake: 0n,
		loading: true,
	})
	await render()
	expect(input().value).toBe('1000')
	expect(rewards()).toEqual([])
	for (const section of container.querySelectorAll('section')) {
		expect(section.textContent).toContain('syncing')
	}
	state.accountIsValidator = true
	state.currentStake = 100000000000000n
	await render()
	expect(input().value).toBe('10000')
	expect(rewards()).toEqual([])
	Object.assign(state, { loading: false, annualReward: 3650 })
	await render()
	expect(rewards()).toEqual([10, 3650 / 12, 3650])
})

test('validator calculator matches the account projection and scales custom stake amounts', async () => {
	await render()
	expect(input().value).toBe('10000')
	expect(rewards()).toEqual([10, 3650 / 12, 3650])
	await changeAmount('20000')
	expect(rewards()).toEqual([20, 7300 / 12, 7300])
})

test.each(['9999.99', '0', '', '-100'])(
	'validator amounts below the minimum (%s) hide projections and reset on blur',
	async (value) => {
		await render()
		await changeAmount(value)
		expect(rewards()).toEqual([])
		expect(container.querySelector('[role="alert"]')?.textContent).toContain(
			'10,000 DOT',
		)
		await blurAmount()
		expect(input().value).toBe('10000')
		expect(container.querySelector('[role="alert"]')).toBeNull()
		expect(rewards()).toEqual([10, 3650 / 12, 3650])
	},
)

test('validator calculators enforce a higher minimum from the chain', async () => {
	state.minValidatorBond = 200000000000000n
	await render()
	expect(input().value).toBe('20000')
	await changeAmount('10000')
	expect(rewards()).toEqual([])
	expect(container.querySelector('[role="alert"]')?.textContent).toContain(
		'20,000 DOT',
	)
	await blurAmount()
	expect(input().value).toBe('20000')
	expect(rewards()).toEqual([20, 7300 / 12, 7300])
})

test('non-validator calculators retain the network rate', async () => {
	state.accountIsValidator = false
	await render()
	expect(input().value).toBe('1000')
	expect(rewards()).toEqual([100 / 365, 100 / 12, 100])
	await changeAmount('500')
	await blurAmount()
	expect(input().value).toBe('500')
	expect(container.querySelector('[role="alert"]')).toBeNull()
	expect(rewards()).toEqual([50 / 365, 50 / 12, 50])
})

test.each([
	{ loading: true, unavailable: false, label: 'syncing' },
	{ loading: false, unavailable: true, label: '—' },
])(
	'unavailable calculator projections show $label instead of false rewards',
	async (overrides) => {
		Object.assign(state, overrides)
		await render()
		expect(rewards()).toEqual([])
		expect(container.querySelectorAll('section')).toHaveLength(3)
		for (const section of container.querySelectorAll('section')) {
			expect(section.textContent).toContain(overrides.label)
		}
	},
)

test('a validator with no bonded stake does not produce infinite projections', async () => {
	state.currentStake = 0n
	await render()
	expect(rewards()).toEqual([0, 0, 0])
})
