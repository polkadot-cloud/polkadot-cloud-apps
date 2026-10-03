// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { FC } from 'react'

type Provider<Props> = FC<Props> | [FC<Props>, Props]

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
