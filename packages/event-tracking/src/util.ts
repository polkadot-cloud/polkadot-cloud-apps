// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SAEnabled } from 'consts'

// Utility to register a simple event with SA
export const onSaEvent = (e: string, a: unknown = {}) => {
	if (!SAEnabled) return
	try {
		// biome-ignore lint/suspicious/noExplicitAny: <need `sa_event` in `window`>
		const w = window as any
		if (w.sa_event) {
			w.sa_event(e, a)
		}
	} catch {
		// SA not supported. Do nothing
	}
}
