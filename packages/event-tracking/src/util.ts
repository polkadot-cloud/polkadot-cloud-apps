// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

type SimpleAnalyticsWindow = Window & {
	sa_event?: (event: string, attributes: unknown) => void
}

// Utility to register a simple event with SA
export const onSaEvent = (event: string, attributes: unknown = {}) => {
	try {
		const { sa_event: sendEvent } = window as SimpleAnalyticsWindow
		sendEvent?.(event, attributes)
	} catch {
		// SA not supported. Do nothing
	}
}
