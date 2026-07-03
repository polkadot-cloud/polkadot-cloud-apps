// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { NetworkId } from 'types'
import { useNetwork } from '../useNetwork'
import { createSingletonSignal } from '../util'
import type { FavoritePoolsHookInterface } from './types'

export type { FavoritePoolsHookInterface } from './types'

const favoritePoolsSignal = createSingletonSignal()
const favoritesByNetwork: Partial<Record<NetworkId, string[]>> = {}

const getFavoritePoolsKey = (network: NetworkId) => `${network}_favorite_pools`

const getLocalFavoritePools = (network: NetworkId): string[] => {
	if (typeof localStorage === 'undefined') {
		return []
	}
	try {
		const localFavorites = localStorage.getItem(getFavoritePoolsKey(network))
		const parsed = localFavorites ? JSON.parse(localFavorites) : []
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

const setLocalFavoritePools = (network: NetworkId, favorites: string[]) => {
	if (typeof localStorage === 'undefined') {
		return
	}
	localStorage.setItem(getFavoritePoolsKey(network), JSON.stringify(favorites))
}

const getFavoritePoolsSnapshot = (network: NetworkId) => {
	favoritesByNetwork[network] ??= getLocalFavoritePools(network)
	return favoritesByNetwork[network]
}

const setFavoritePools = (network: NetworkId, favorites: string[]) => {
	favoritesByNetwork[network] = favorites
	setLocalFavoritePools(network, favorites)
	favoritePoolsSignal.emit()
}

const syncFavoritePools = (network: NetworkId) => {
	const localFavorites = getLocalFavoritePools(network)
	if (
		JSON.stringify(getFavoritePoolsSnapshot(network)) !==
		JSON.stringify(localFavorites)
	) {
		favoritesByNetwork[network] = localFavorites
		favoritePoolsSignal.emit()
	}
}
const serverFavoritePoolsSnapshot: string[] = []

export const useFavoritePools = (): FavoritePoolsHookInterface => {
	const { network } = useNetwork()
	const favorites = useSyncExternalStore(
		favoritePoolsSignal.subscribe,
		() => getFavoritePoolsSnapshot(network),
		() => serverFavoritePoolsSnapshot,
	)

	useEffect(() => {
		syncFavoritePools(network)
	}, [network])

	const addFavorite = useCallback(
		(address: string) => {
			const current = getFavoritePoolsSnapshot(network)
			if (current.includes(address)) {
				return
			}
			setFavoritePools(network, [...current, address])
		},
		[network],
	)

	const removeFavorite = useCallback(
		(address: string) => {
			setFavoritePools(
				network,
				getFavoritePoolsSnapshot(network).filter(
					(favorite) => favorite !== address,
				),
			)
		},
		[network],
	)

	return {
		favorites,
		addFavorite,
		removeFavorite,
	}
}
