// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { WarningProps } from '../types'
import { Wrapper } from './Wrapper'

export { WarningLink } from './Wrapper'

export const Warning = ({ text, status = 'warning' }: WarningProps) => (
	<Wrapper $danger={status === 'danger'}>
		<h4>{text}</h4>
	</Wrapper>
)
