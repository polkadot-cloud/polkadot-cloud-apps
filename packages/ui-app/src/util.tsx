// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	isExtensionLocal,
	removeExtensionFromLocal,
} from '@polkadot-cloud/connect-core'
import { DisabledExtensions } from 'consts/extensions'
import type { FC } from 'react'

type Provider<Props> = FC<Props> | [FC<Props>, Props]

// Removes disabled extensions from the saved reconnect list. Must run before `ConnectProvider`
// mounts so previously connected disabled extensions are not reconnected.
export const clearDisabledExtensionsLocal = () => {
	for (const id of DisabledExtensions) {
		if (isExtensionLocal(id)) {
			removeExtensionFromLocal(id)
		}
	}
}

// Compose providers from outermost to innermost around the wrapped component.
export const withProviders = (
	// biome-ignore lint/suspicious/noExplicitAny: Each provider accepts a different props type.
	providers: Provider<any>[],
	Wrapped: FC,
) =>
	providers.reduceRight(
		(children, provider) => {
			if (Array.isArray(provider)) {
				const [Component, props] = provider
				return <Component {...props}>{children}</Component>
			}
			const Component = provider
			return <Component>{children}</Component>
		},
		<Wrapped />,
	)
