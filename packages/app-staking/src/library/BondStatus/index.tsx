// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import { Wrapper } from './Wrapper'

export const BondStatus = ({
	label,
	noMargin = false,
	status,
	value,
}: {
	label: ReactNode
	noMargin?: boolean
	status: string
	value?: ReactNode
}) => (
	<Wrapper $status={status} $noMargin={noMargin}>
		<h5>
			<span>{label}</span>
			{value !== undefined && value !== null ? (
				<>
					<span className="separator" aria-hidden="true" />
					<span>{value}</span>
				</>
			) : null}
		</h5>
	</Wrapper>
)
