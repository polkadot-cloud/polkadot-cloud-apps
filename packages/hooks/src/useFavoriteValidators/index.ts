// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getRelayChainData } from 'consts/util'
import { useValidatorPrefs } from 'data-gate'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import type { NetworkId, Validator } from 'types'
import { useNetwork } from '../useNetwork'
import { createSingletonSignal } from '../util'
import type { FavoriteValidatorsHookInterface } from './types'

export type { FavoriteValidatorsHookInterface } from './types'

type FavoriteValidatorsStore = {
	favorites: string[]
}

const favoriteValidatorsSignal = createSingletonSignal()
const storesByNetwork: Partial<Record<NetworkId, FavoriteValidatorsStore>> = {}

const getFavoriteValidatorsKey = (network: NetworkId) => `${network}_favorites`

const getLocalFavoriteValidators = (network: NetworkId): string[] => {
	if (typeof localStorage === 'undefined') {
		return []
	}
	try {
		const localFavorites = localStorage.getItem(
			getFavoriteValidatorsKey(network),
		)
		const parsed = localFavorites ? JSON.parse(localFavorites) : []
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

const setLocalFavoriteValidators = (
	network: NetworkId,
	favorites: string[],
) => {
	if (typeof localStorage === 'undefined') {
		return
	}
	try {
		localStorage.setItem(
			getFavoriteValidatorsKey(network),
			JSON.stringify(favorites),
		)
	} catch {
		// Ignore write failures (e.g. storage disabled or quota exceeded).
	}
}

const getFavoriteValidatorsSnapshot = (network: NetworkId) => {
	storesByNetwork[network] ??= {
		favorites: getLocalFavoriteValidators(network),
	}
	return storesByNetwork[network]
}

const setFavoriteValidators = (network: NetworkId, favorites: string[]) => {
	const current = getFavoriteValidatorsSnapshot(network)
	storesByNetwork[network] = {
		...current,
		favorites,
	}
	setLocalFavoriteValidators(network, favorites)
	favoriteValidatorsSignal.emit()
}

const syncFavoriteValidators = (network: NetworkId) => {
	const localFavorites = getLocalFavoriteValidators(network)
	const current = getFavoriteValidatorsSnapshot(network)
	if (JSON.stringify(current.favorites) !== JSON.stringify(localFavorites)) {
		storesByNetwork[network] = {
			favorites: localFavorites,
		}
		favoriteValidatorsSignal.emit()
	}
}

const serverFavoriteValidatorsSnapshot: FavoriteValidatorsStore = {
	favorites: [],
}

export const useFavoriteValidators = (): FavoriteValidatorsHookInterface => {
	const { network } = useNetwork()
	const { name } = getRelayChainData(network)
	const { favorites } = useSyncExternalStore(
		favoriteValidatorsSignal.subscribe,
		() => getFavoriteValidatorsSnapshot(name),
		() => serverFavoriteValidatorsSnapshot,
	)

	useEffect(() => {
		syncFavoriteValidators(name)
	}, [name])

	const { data: prefs } = useValidatorPrefs(favorites)
	const favoritesList = useMemo<Validator[] | null>(() => {
		if (!favorites.length) return []
		if (!prefs) return null
		return favorites.flatMap((address) => {
			const pref = prefs[address]
			return pref ? [{ address, prefs: pref }] : []
		})
	}, [favorites, prefs])

	const addFavorite = useCallback(
		(address: string) => {
			const current = getFavoriteValidatorsSnapshot(name).favorites
			if (current.includes(address)) {
				return
			}
			setFavoriteValidators(name, [...current, address])
		},
		[name],
	)

	const removeFavorite = useCallback(
		(address: string) => {
			setFavoriteValidators(
				name,
				getFavoriteValidatorsSnapshot(name).favorites.filter(
					(favorite) => favorite !== address,
				),
			)
		},
		[name],
	)

	return {
		addFavorite,
		removeFavorite,
		favorites,
		favoritesList,
	}
}
