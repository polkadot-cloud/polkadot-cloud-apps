// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createElement, StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { DataGateProvider, useDataResource } from '../src/react/provider'

it('server rendering a modular provider and consumer does not start fetching', () => {
	const load = vi.fn(async () => 1)
	const Price = () => {
		const result = useDataResource({ name: 'tokenPrice', key: ['DOT'], load })
		return createElement('span', null, result.status)
	}
	const html = renderToString(
		createElement(
			StrictMode,
			null,
			createElement(
				DataGateProvider,
				{ network: 'polkadot', apiEnabled: true, modules: ['prices'] },
				createElement(Price),
			),
		),
	)
	expect(html).toContain('idle')
	expect(load).not.toHaveBeenCalled()
})
