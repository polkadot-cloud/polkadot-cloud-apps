// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useQuoteExpired } from '../../hooks/src/useQuoteExpired'

let root: Root
let container: HTMLDivElement
const rendered = vi.fn()
const Probe = ({ fetchedAt }: { fetchedAt?: number }) => {
	const expired = useQuoteExpired(fetchedAt)
	rendered(expired)
	return createElement(
		'button',
		{ type: 'button', disabled: expired },
		'Swap assets',
	)
}
const render = (fetchedAt?: number) =>
	act(async () => root.render(createElement(Probe, { fetchedAt })))
const advance = (milliseconds: number) =>
	act(async () => vi.advanceTimersByTimeAsync(milliseconds))

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.useFakeTimers()
	vi.setSystemTime(100_000)
	rendered.mockClear()
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})

afterEach(async () => {
	await act(async () => root.unmount())
	container.remove()
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

test('a valid quote stays stable until it expires instead of rendering every second', async () => {
	await render(Date.now())
	await advance(5_000)
	expect(rendered).toHaveBeenCalledTimes(1)
	expect(container.querySelector('button')!.disabled).toBe(false)

	await advance(25_000)
	expect(rendered).toHaveBeenCalledTimes(1)
	await advance(1)
	expect(rendered).toHaveBeenCalledTimes(2)
	expect(container.querySelector('button')!.disabled).toBe(true)
})

test('refreshing a quote cancels its previous expiry and enables an expired quote again', async () => {
	await render(Date.now())
	await advance(20_000)
	await render(Date.now())
	await advance(10_001)
	expect(rendered).toHaveBeenCalledTimes(2)
	expect(container.querySelector('button')!.disabled).toBe(false)

	await advance(20_000)
	expect(container.querySelector('button')!.disabled).toBe(true)
	await render(Date.now())
	expect(container.querySelector('button')!.disabled).toBe(false)
	await advance(30_001)
	expect(container.querySelector('button')!.disabled).toBe(true)
})

test('missing or already expired quotes do not start a render loop', async () => {
	await render()
	await advance(60_000)
	expect(rendered).toHaveBeenCalledTimes(1)

	await render(Date.now() - 30_001)
	expect(container.querySelector('button')!.disabled).toBe(true)
	await advance(60_000)
	expect(rendered).toHaveBeenCalledTimes(2)

	await render(Date.now())
	await render()
	const calls = rendered.mock.calls.length
	await advance(60_000)
	expect(rendered).toHaveBeenCalledTimes(calls)
})
