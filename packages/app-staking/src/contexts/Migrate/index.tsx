// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffectIgnoreInitial } from '@w3ux/hooks'
import { useApi } from 'hooks/useApi'
import { useSyncing } from 'hooks/useSyncing'
import type { ReactNode } from 'react'
import { createContext, useState } from 'react'
import { version } from '../../../package.json'

export const MigrateContext = createContext<null>(null)

export const MigrateProvider = ({ children }: { children: ReactNode }) => {
	const { isReady } = useApi()
	const { syncing } = useSyncing(['initialization'])

	// The local app version of the current user
	const localAppVersion = localStorage.getItem('app_version')

	// Store whether the migration check has taken place
	const [done, setDone] = useState<boolean>(localAppVersion === version)

	useEffectIgnoreInitial(() => {
		if (isReady && !syncing && !done) {
			// Global migrations have already run before service initialization. Keep the app version
			// lifecycle here so app-specific cache refreshes and reloads remain intact.
			if (localAppVersion !== version) {
				localStorage.setItem('app_version', version)
				setDone(true)

				// Reload the page to ensure all changes are applied
				window.location.reload()
			}
		}
	}, [isReady, syncing])

	return (
		<MigrateContext.Provider value={null}>{children}</MigrateContext.Provider>
	)
}
