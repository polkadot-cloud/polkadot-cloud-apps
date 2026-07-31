// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { type ComponentType, lazy } from 'react'

export type OverlayLoader<TModule = Record<string, unknown>> =
	() => Promise<TModule>

export const lazyNamed = <TModule extends Record<string, unknown>>(
	load: OverlayLoader<TModule>,
	exportName: string,
) =>
	lazy(async () => {
		const module = await load()
		const component = module[exportName]

		if (!component) {
			throw new Error(`Missing overlay export: ${exportName}`)
		}

		if (typeof component !== 'function') {
			throw new Error(
				`Export ${exportName} is not a component (expected function, got ${typeof component})`,
			)
		}

		return { default: component as ComponentType }
	})
