// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import { Wrapper } from './Wrappers'

export const Container = ({ children }: { children: ReactNode }) => (
	<Wrapper>
		<div className="hide-scrollbar">
			<div>{children}</div>
		</div>
	</Wrapper>
)
