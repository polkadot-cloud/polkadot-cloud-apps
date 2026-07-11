// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import { Wrapper } from './Wrapper'

export const BondStatus = ({
	children,
	noMargin = false,
	status,
}: {
	children: ReactNode
	noMargin?: boolean
	status: string
}) => (
	<Wrapper $status={status} $noMargin={noMargin}>
		<h5>{children}</h5>
	</Wrapper>
)
