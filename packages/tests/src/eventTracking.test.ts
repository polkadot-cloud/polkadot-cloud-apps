// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

let events: typeof import('../../event-tracking/src/index')
const sa = vi.fn()
const umami = vi.fn()

const addUmamiScript = () => {
	const script = document.createElement('script')
	script.src = 'https://ua.polkadot.cloud/script.js'
	script.dataset.websiteId = 'test-website-id'
	document.head.append(script)
	return script
}

beforeEach(async () => {
	vi.resetModules()
	sa.mockReset()
	umami.mockReset()
	vi.stubGlobal('sa_event', sa)
	vi.stubGlobal('umami', { track: umami })
	events = await import('../../event-tracking/src/index')
})

afterEach(() => {
	document.querySelectorAll('script[data-website-id]').forEach((s) => {
		s.remove()
	})
	vi.unstubAllGlobals()
})

test('sends existing names and properties to both trackers', () => {
	events.onNewUserEvent({ utmSource: 'newsletter' })
	events.onSendTransactionSubmittedEvent('Polkadot', 'DOT')

	for (const tracker of [sa, umami]) {
		expect(tracker.mock.calls).toEqual([
			['new_user', { utmSource: 'newsletter' }],
			['polkadot_tx_submitted_send_dot', {}],
		])
	}
})

test.each(['sa_event', 'umami'])(
	'continues tracking when %s is absent',
	(missing) => {
		vi.stubGlobal(missing, undefined)
		expect(() => events.onReturningUserEvent()).not.toThrow()
		expect(missing === 'sa_event' ? umami : sa).toHaveBeenCalledExactlyOnceWith(
			'returning_user',
			{},
		)
	},
)

test.each(['sa_event', 'umami'])(
	'isolates a synchronous failure in %s',
	(failing) => {
		const broken = failing === 'sa_event' ? sa : umami
		broken.mockImplementation(() => {
			throw new Error('Tracker unavailable')
		})
		expect(() => events.onReturningUserEvent()).not.toThrow()
		expect(failing === 'sa_event' ? umami : sa).toHaveBeenCalledOnce()
	},
)

test('handles rejected promises from either tracker', async () => {
	sa.mockRejectedValue(new Error('SA request rejected'))
	umami.mockRejectedValue(new Error('Umami request rejected'))
	events.onReturningUserEvent()
	await new Promise((resolve) => setTimeout(resolve, 0))
	expect(sa).toHaveBeenCalledOnce()
	expect(umami).toHaveBeenCalledOnce()
})

test('does nothing safely without browser globals', () => {
	vi.stubGlobal('window', undefined)
	expect(() => events.onNewUserEvent()).not.toThrow()
	expect(sa).not.toHaveBeenCalled()
	expect(umami).not.toHaveBeenCalled()
})

test('flushes startup events once without duplicating SA events', () => {
	vi.stubGlobal('umami', undefined)
	const script = addUmamiScript()
	const attributes = { utmSource: 'newsletter' }
	events.onNewUserEvent(attributes)
	events.onLocaleFromUrlEvent('de')
	attributes.utmSource = 'changed-after-event'
	expect(sa).toHaveBeenCalledTimes(2)
	expect(umami).not.toHaveBeenCalled()

	vi.stubGlobal('umami', { track: umami })
	script.dispatchEvent(new Event('load'))
	script.dispatchEvent(new Event('load'))
	expect(umami.mock.calls).toEqual([
		['new_user', { utmSource: 'newsletter' }],
		['locale_from_url_de', {}],
	])
	expect(sa).toHaveBeenCalledTimes(2)

	events.onLocaleFromModalEvent('en')
	expect(umami).toHaveBeenLastCalledWith('locale_from_modal_en', {})
	expect(sa).toHaveBeenCalledTimes(3)
})

test('does not queue when the production Umami script is absent', () => {
	vi.stubGlobal('umami', undefined)
	events.onNewUserEvent()
	const script = addUmamiScript()
	vi.stubGlobal('umami', { track: umami })
	script.dispatchEvent(new Event('load'))
	expect(umami).not.toHaveBeenCalled()
	expect(sa).toHaveBeenCalledOnce()
})

test('drops queued events on a script error and keeps SA working', () => {
	vi.stubGlobal('umami', undefined)
	const script = addUmamiScript()
	events.onNewUserEvent()
	script.dispatchEvent(new Event('error'))
	events.onReturningUserEvent()
	vi.stubGlobal('umami', { track: umami })
	script.dispatchEvent(new Event('load'))
	expect(umami).not.toHaveBeenCalled()
	expect(sa).toHaveBeenCalledTimes(2)
	events.onLocaleFromModalEvent('en')
	expect(umami).toHaveBeenCalledExactlyOnceWith('locale_from_modal_en', {})
})

test('bounds the queue when the script stalls', () => {
	vi.stubGlobal('umami', undefined)
	const script = addUmamiScript()
	for (let i = 0; i < 105; i++) events.onLocaleFromUrlEvent(String(i))
	vi.stubGlobal('umami', { track: umami })
	script.dispatchEvent(new Event('load'))
	expect(sa).toHaveBeenCalledTimes(105)
	expect(umami).toHaveBeenCalledTimes(100)
	expect(umami).toHaveBeenLastCalledWith('locale_from_url_99', {})
})

test('a failed queued event does not stop subsequent events', () => {
	vi.stubGlobal('umami', undefined)
	const script = addUmamiScript()
	events.onNewUserEvent()
	events.onLocaleFromUrlEvent('en')
	umami.mockImplementationOnce(() => {
		throw new Error('First event failed')
	})
	vi.stubGlobal('umami', { track: umami })
	expect(() => script.dispatchEvent(new Event('load'))).not.toThrow()
	expect(umami).toHaveBeenCalledTimes(2)
	expect(umami).toHaveBeenLastCalledWith('locale_from_url_en', {})
})

test('shortens long Umami names consistently while leaving SA unchanged', () => {
	const source = 'campaign_'.repeat(8)
	const fullName = `conversion_${source}`
	events.onConversionEvent(source)
	events.onConversionEvent(source)
	events.onConversionEvent(`${source}_other`)
	const [name, attributes] = umami.mock.calls[0]
	expect(name).toHaveLength(50)
	expect(name).toMatch(/_[0-9a-f]{8}$/)
	expect(attributes).toEqual({ original_event_name: fullName })
	expect(umami.mock.calls[1]).toEqual(umami.mock.calls[0])
	expect(umami.mock.calls[2][0]).not.toBe(name)
	expect(sa).toHaveBeenNthCalledWith(1, fullName, {})
	expect(sa).toHaveBeenNthCalledWith(3, `${fullName}_other`, {})
})

test('preserves names at the 50-character boundary and caps original-name data', () => {
	const source = 'a'.repeat(39)
	events.onConversionEvent(source)
	expect(umami).toHaveBeenLastCalledWith(`conversion_${source}`, {})
	events.onConversionEvent('b'.repeat(600))
	expect(umami.mock.calls[1][1].original_event_name).toHaveLength(500)
})
