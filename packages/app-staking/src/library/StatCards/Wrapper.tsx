// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import { Stat } from 'ui-core/base'

interface WrapperProps {
	isPreloading?: boolean
	children: ReactNode
}

export const Wrapper = ({ isPreloading = false, children }: WrapperProps) => {
	if (isPreloading) {
		return <Stat.Loading />
	}
	return <>{children}</>
}
