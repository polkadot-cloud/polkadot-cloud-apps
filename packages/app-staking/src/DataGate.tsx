// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DataGateProvider } from 'data-gate'
import { useApi } from 'hooks/useApi'
import type { ReactNode } from 'react'

export const DataGate = ({ children }: { children: ReactNode }) => {
	const { isReady, activeEra, serviceApi } = useApi()

	return (
		<DataGateProvider node={serviceApi} ready={isReady} era={activeEra.index}>
			{children}
		</DataGateProvider>
	)
}
