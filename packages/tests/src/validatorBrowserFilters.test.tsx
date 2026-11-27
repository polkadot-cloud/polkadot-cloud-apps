// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import { Controls } from '../../app-staking/src/library/StakingApiValidatorList/Controls'
import { DEFAULT_VALIDATOR_LIST_CONFIG } from '../../app-staking/src/library/StakingApiValidatorList/filtersConfig'

vi.mock('../../hooks/src/useTheme', () => ({
	useTheme: () => ({ themeElementRef: { current: document.body } }),
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({ t: (key: string) => key }),
	}),
)

let root: Root

const renderControls = async (
	apiFilters: boolean,
	orderOptions?: Array<{ key: string; label: string }>,
) => {
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
	root = createRoot(container)
	const onApply = vi.fn()
	await act(() =>
		root.render(
			createElement(Controls, {
				apiFilters,
				orderOptions,
				config: {
					...DEFAULT_VALIDATOR_LIST_CONFIG,
					order: orderOptions?.[0]?.key ?? DEFAULT_VALIDATOR_LIST_CONFIG.order,
				},
				disabled: false,
				onApply,
			}),
		),
	)
	return onApply
}

afterEach(async () => {
	await act(() => root.unmount())
	document.body.replaceChildren()
	vi.unstubAllGlobals()
})

const button = (text: string) =>
	Array.from(document.querySelectorAll('button')).find(
		(item) => item.textContent === text,
	)
const click = (element: HTMLElement) => act(() => element.click())
const clickButton = (text: string) => click(button(text)!)
const checkboxes = (state = '') =>
	Array.from(
		document.querySelectorAll<HTMLInputElement>(
			`input[type="checkbox"]${state}`,
		),
	)
const checkbox = (label: string) =>
	checkboxes().find((input) => input.labels?.[0].textContent === label)!
const labels = (state = '') =>
	checkboxes(state).map((input) => input.labels?.[0].textContent)

it('keeps unavailable groups visible and applies only enabled selections', async () => {
	const onApply = await renderControls(true)
	expect(button('apply')?.disabled).toBe(true)
	await clickButton('active')
	await clickButton('all')
	expect(button('apply')?.disabled).toBe(true)
	expect(button('all')?.getAttribute('aria-pressed')).toBe('true')
	await clickButton('showOnly')
	expect(labels()).toEqual([
		'missingIdentity',
		'blockedNominations',
		'active',
		'inactive',
	])
	expect(labels(':disabled')).toEqual(['missingIdentity', 'blockedNominations'])
	await click(checkbox('missingIdentity'))
	expect(button('showOnly (1)')).toBeUndefined()
	expect(document.activeElement).toBe(checkbox('active'))
	await click(checkbox('active'))
	await clickButton('showOnly (1)')
	await clickButton('missingIdentity')
	await clickButton('blockedNominations')
	await clickButton('showOnly (1)')
	expect(labels(':disabled')).toEqual([])
	await click(checkbox('missingIdentity'))
	await click(checkbox('blockedNominations'))
	await clickButton('showOnly (3)')
	await clickButton('inactive')
	await clickButton('blockedNominations')
	await clickButton('showOnly (1)')
	expect(labels(':enabled')).toEqual(['missingIdentity'])
	expect(labels(':disabled')).toEqual([
		'blockedNominations',
		'active',
		'inactive',
	])
	expect(labels(':checked')).toEqual(['missingIdentity'])
	await clickButton('showOnly (1)')
	expect(onApply).not.toHaveBeenCalled()
	await clickButton('apply')
	expect(onApply).toHaveBeenCalledExactlyOnceWith({
		...DEFAULT_VALIDATOR_LIST_CONFIG,
		filters: {
			active: false,
			excludeBlocked: true,
			excludeMissingIdentity: false,
			matchAny: ['MISSING_IDENTITY'],
		},
	})
	await clickButton('missingIdentity')
	expect(button('showOnly')?.disabled).toBe(true)
	await clickButton('clear')
	await clickButton('showOnly')
	expect(labels(':enabled')).toHaveLength(4)
	expect(labels(':checked')).toEqual([])
})

it('keeps the node browser active-only toggle', async () => {
	const onApply = await renderControls(false, [
		{ key: 'ACTIVITY', label: 'activity' },
	])
	expect(button('showOnly')).toBeUndefined()
	await clickButton('activeValidators')
	await clickButton('apply')
	expect(onApply.mock.lastCall?.[0].filters).toMatchObject({ active: true })
	await clickButton('clear')
	await clickButton('apply')
	expect(onApply.mock.lastCall?.[0]).toEqual({
		filters: { excludeBlocked: false, excludeMissingIdentity: false },
		order: 'ACTIVITY',
		search: '',
	})
})
