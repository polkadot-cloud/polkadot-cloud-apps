// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

type EventAttributes = Record<string, unknown>
type AnalyticsEvent = { name: string; attributes: EventAttributes }
type Tracker = (event: string, attributes: EventAttributes) => unknown
type AnalyticsWindow = Window & {
	sa_event?: Tracker
	umami?: { track: Tracker }
}

const pendingUmamiEvents: AnalyticsEvent[] = []
let umamiScriptState: 'idle' | 'loading' | 'settled' = 'idle'

const sendSafely = async (send: () => unknown) => {
	try {
		await send()
	} catch {
		// Tracker failures must not affect the app or the other tracker.
	}
}

const toUmamiEvent = (
	name: string,
	attributes: EventAttributes,
): AnalyticsEvent => {
	if (name.length <= 50) return { name, attributes }

	// Keep long names distinct within Umami's 50-character limit (FNV-1a).
	let hash = 2166136261
	for (let index = 0; index < name.length; index++) {
		hash = Math.imul(hash ^ name.charCodeAt(index), 16777619)
	}
	return {
		name: `${name.slice(0, 41)}_${(hash >>> 0).toString(16).padStart(8, '0')}`,
		attributes: { ...attributes, original_event_name: name.slice(0, 500) },
	}
}

const sendUmamiEvent = ({ name, attributes }: AnalyticsEvent) =>
	sendSafely(() => (window as AnalyticsWindow).umami?.track(name, attributes))

const trackUmamiEvent = (event: AnalyticsEvent) => {
	if (typeof (window as AnalyticsWindow).umami?.track === 'function') {
		return sendUmamiEvent(event)
	}
	if (umamiScriptState === 'settled') return

	// The script is only injected in production. Never queue on other builds.
	const script = document.querySelector<HTMLScriptElement>(
		'script[data-website-id][src="https://ua.polkadot.cloud/script.js"]',
	)
	if (!script) return

	// Bound the queue if a blocked or stalled script never finishes loading.
	if (pendingUmamiEvents.length < 100) {
		pendingUmamiEvents.push({ ...event, attributes: { ...event.attributes } })
	}
	if (umamiScriptState === 'loading') return
	umamiScriptState = 'loading'

	const settle = ({ type }: Event) => {
		script.removeEventListener('load', settle)
		script.removeEventListener('error', settle)
		umamiScriptState = 'settled'
		const queued = pendingUmamiEvents.splice(0)
		if (type === 'load') queued.forEach(sendUmamiEvent)
	}
	script.addEventListener('load', settle)
	script.addEventListener('error', settle)
}

// Keep SA events during the migration, and send the same events to Umami.
export const onAnalyticsEvent = (
	event: string,
	attributes: EventAttributes = {},
) => {
	if (typeof window === 'undefined') return

	sendSafely(() => (window as AnalyticsWindow).sa_event?.(event, attributes))
	sendSafely(() => trackUmamiEvent(toUmamiEvent(event, attributes)))
}
