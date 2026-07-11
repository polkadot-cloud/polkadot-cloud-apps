// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import { Wrapper } from './Wrapper'

export const BondStatus = ({
	label,
	noMargin = false,
	separator = ' / ',
	status,
	value,
}: {
	label: ReactNode
	noMargin?: boolean
	separator?: string
	status: string
	value?: ReactNode
}) => (
	<Wrapper $status={status} $noMargin={noMargin}>
		<h5>
			{label}
			{value !== undefined && value !== null ? (
				<>
					{separator}
					{value}
				</>
			) : null}
		</h5>
	</Wrapper>
)
