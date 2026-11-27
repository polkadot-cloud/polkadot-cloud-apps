// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import {
	Controls,
	DEFAULT_VALIDATOR_LIST_CONFIG,
} from '../../app-staking/src/library/StakingApiValidatorList/Controls'

vi.mock('../../hooks/src/useTheme', () => ({
	useTheme: () => ({ themeElementRef: { current: document.body } }),
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({ t: (key: string) => key }),
	}),
)

const renderControls = async (apiFilters: boolean) => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	)
	const container = document.body.appendChild(document.createElement('div'))
	const root = createRoot(container)
	const onApply = vi.fn()
	await act(() =>
		root.render(
			createElement(Controls, {
				apiFilters,
				config: DEFAULT_VALIDATOR_LIST_CONFIG,
				disabled: false,
				onApply,
			}),
		),
	)
	return { onApply, unmount: () => act(() => root.unmount()) }
}

afterEach(() => {
	document.body.replaceChildren()
	vi.unstubAllGlobals()
})

const button = (text: string) =>
	Array.from(document.querySelectorAll('button')).find(
		(item) => item.textContent === text,
	)
const click = (element: HTMLElement) => act(() => element.click())
const labels = (state = '') =>
	Array.from(
		document.querySelectorAll(`label:has(input[type="checkbox"]${state})`),
		(label) => label.textContent,
	)

it('keeps unavailable groups visible and applies only enabled selections', async () => {
	const { onApply, unmount } = await renderControls(true)
	try {
		expect(button('all')?.getAttribute('aria-pressed')).toBe('true')
		await click(button('showOnly')!)
		expect(labels()).toEqual([
			'missingIdentity',
			'blockedNominations',
			'active',
			'inactive',
		])
		expect(labels(':disabled')).toEqual([
			'missingIdentity',
			'blockedNominations',
		])
		await click(document.querySelector<HTMLInputElement>('input:disabled')!)
		expect(button('showOnly (1)')).toBeUndefined()
		expect(document.activeElement).toBe(
			document.querySelector('input[type="checkbox"]:enabled'),
		)
		await click(
			document.querySelector<HTMLInputElement>(
				'input[type="checkbox"]:enabled',
			)!,
		)
		await click(button('showOnly (1)')!)
		await click(button('missingIdentity')!)
		await click(button('blockedNominations')!)
		await click(button('showOnly (1)')!)
		expect(labels(':disabled')).toEqual([])
		for (const checkbox of Array.from(
			document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
		).slice(0, 2)) {
			await click(checkbox)
		}
		await click(button('showOnly (3)')!)
		await click(button('inactive')!)
		await click(button('blockedNominations')!)
		await click(button('showOnly (1)')!)
		expect(labels(':enabled')).toEqual(['missingIdentity'])
		expect(labels(':disabled')).toEqual([
			'blockedNominations',
			'active',
			'inactive',
		])
		expect(labels(':disabled:checked')).toEqual([])
		expect(
			document.querySelector<HTMLInputElement>('input[type="checkbox"]')
				?.checked,
		).toBe(true)
		await click(button('showOnly (1)')!)
		expect(onApply).not.toHaveBeenCalled()
		await click(button('apply')!)
		expect(onApply).toHaveBeenCalledExactlyOnceWith({
			...DEFAULT_VALIDATOR_LIST_CONFIG,
			filters: {
				active: false,
				excludeBlocked: true,
				excludeMissingIdentity: false,
				matchAny: ['MISSING_IDENTITY'],
			},
		})
		await click(button('missingIdentity')!)
		expect(button('showOnly')?.disabled).toBe(true)
		await click(button('clear')!)
		await click(button('showOnly')!)
		expect(labels(':enabled')).toHaveLength(4)
		expect(document.querySelector('input:checked')).toBeNull()
	} finally {
		await unmount()
	}
})

it('keeps the node browser active-only toggle', async () => {
	const { onApply, unmount } = await renderControls(false)
	try {
		expect(button('showOnly')).toBeUndefined()
		await click(button('activeValidators')!)
		await click(button('apply')!)
		expect(onApply.mock.lastCall?.[0].filters).toMatchObject({ active: true })
	} finally {
		await unmount()
	}
})
