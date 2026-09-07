// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { setStateWithRef, shuffle } from '@w3ux/utils'
import { useDataResource } from 'data-gate/react'
import { poolDirectory, poolNominations } from 'data-gate/resources/pools'
import { hexToString } from 'dedot/utils'
import { useApi } from 'hooks/useApi'
import { useCreatePoolAccounts } from 'hooks/useCreatePoolAccounts'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type {
	AnyJson,
	BondedPool,
	BondedPoolQuery,
	Nominator,
	PoolTab,
} from 'types'
import { poolSearchFilter } from 'utils'
import type { BondedPoolsContextState } from './types'

export const [BondedPoolsContext, useBondedPools] =
	createSafeContext<BondedPoolsContextState>()

export const BondedPoolsProvider = ({ children }: { children: ReactNode }) => {
	const { activeEra, serviceApi } = useApi()
	const createPoolAccounts = useCreatePoolAccounts()

	// Store bonded pools. Used implicitly in callbacks, ref is also defined
	const [bondedPools, setBondedPools] = useState<BondedPool[]>([])
	const bondedPoolsRef = useRef(bondedPools)

	// Track the sync status of `bondedPools`
	const directory = useDataResource(poolDirectory())
	const nominations = useDataResource(
		poolNominations(bondedPools.map(({ addresses }) => addresses.stash)),
	)

	// Store bonded pools metadata
	const [poolsMetaData, setPoolsMetadata] = useState<Record<number, string>>({})

	// Store bonded pools nominations
	const [poolsNominations, setPoolsNominations] = useState<
		Record<string, Nominator | undefined>
	>({})

	// Store pool list active tab. Defaults to `Active` tab
	const [poolListActiveTab, setPoolListActiveTab] = useState<PoolTab>('Active')

	useEffect(() => {
		const entries = directory.data?.entries ?? []
		setStateWithRef(
			shuffle(entries.map(([id, pool]) => getPoolWithAddresses(id, pool))),
			setBondedPools,
			bondedPoolsRef,
		)
		setPoolsMetadata(
			Object.fromEntries(
				(directory.data?.metadata ?? []).map((value, index) => [
					entries[index][0],
					hexToString(value),
				]),
			),
		)
	}, [directory.data])
	useEffect(() => {
		setPoolsNominations(
			formatPoolsNominations(
				nominations.data ?? [],
				bondedPools.map(({ id }) => id),
			),
		)
	}, [nominations.data])

	// Format raw pool nominations data
	const formatPoolsNominations = (
		raw: (Nominator | undefined)[],
		ids: number[],
	) =>
		Object.fromEntries(
			raw.map((nominator, i: number) => {
				if (!nominator) {
					return [ids[i], undefined]
				}
				const { targets, ...rest } = nominator
				return [
					String(ids[i]),
					{
						targets,
						...rest,
					},
				]
			}),
		)

	// Queries a bonded pool and injects ID and addresses to a result
	const queryBondedPool = async (
		id: number,
	): Promise<BondedPool | undefined> => {
		const bondedPool = await serviceApi.query.bondedPool(id)
		if (!bondedPool) {
			return
		}
		return {
			...bondedPool,
			id,
			addresses: createPoolAccounts(id),
		}
	}

	// Helper: to add addresses to pool record
	const getPoolWithAddresses = (id: number, pool: BondedPoolQuery) => ({
		...pool,
		id,
		addresses: createPoolAccounts(id),
	})

	const getBondedPool = (poolId: number) =>
		bondedPools.find((p) => String(p.id) === String(poolId)) ?? null

	const updateBondedPools = (updatedPools: BondedPool[]) => {
		if (!updatedPools) {
			return
		}

		setStateWithRef(
			bondedPools.map(
				(original) =>
					updatedPools.find((updated) => updated.id === original.id) ||
					original,
			),
			setBondedPools,
			bondedPoolsRef,
		)
	}

	const updatePoolNominations = (id: number, newTargets: string[]) => {
		const newPoolsNominations = { ...poolsNominations }

		let record = newPoolsNominations?.[id]
		if (record) {
			record.targets = newTargets
		} else {
			record = {
				submittedIn: activeEra.index,
				targets: newTargets,
				suppressed: false,
			}
		}
		newPoolsNominations[id] = record
		setPoolsNominations(newPoolsNominations)
	}

	const removeFromBondedPools = (id: number) => {
		setStateWithRef(
			bondedPools.filter((b) => b.id !== id),
			setBondedPools,
			bondedPoolsRef,
		)
	}

	// adds a record to bondedPools
	// currently only used when a new pool is created
	const addToBondedPools = (pool: BondedPool) => {
		if (!pool) {
			return
		}

		const exists = bondedPools.find((b) => b.id === pool.id)
		if (!exists) {
			setStateWithRef(bondedPools.concat(pool), setBondedPools, bondedPoolsRef)
		}
	}

	// Determine roles to replace from roleEdits
	const toReplace = (roleEdits: AnyJson) => {
		const root = roleEdits?.root?.newAddress ?? ''
		const nominator = roleEdits?.nominator?.newAddress ?? ''
		const bouncer = roleEdits?.bouncer?.newAddress ?? ''

		return {
			root,
			nominator,
			bouncer,
		}
	}

	// Replaces the pool roles from roleEdits
	const replacePoolRoles = (poolId: number, roleEdits: AnyJson) => {
		let pool = bondedPools.find((b) => b.id === poolId) || null

		if (!pool) {
			return
		}

		pool = {
			...pool,
			roles: {
				...pool.roles,
				...toReplace(roleEdits),
			},
		}

		const newBondedPools = [
			...bondedPools.map((b) => (b.id === poolId && pool !== null ? pool : b)),
		]

		setStateWithRef(newBondedPools, setBondedPools, bondedPoolsRef)
	}

	// Wrapped pool search filter that uses the provider's metadata. Memoised so consumers that depend
	// on this function do not re-render when unrelated state in this provider changes
	const wrappedPoolSearchFilter = useCallback(
		(pools: BondedPool[], searchTerm: string) =>
			poolSearchFilter(pools, searchTerm, poolsMetaData),
		[poolsMetaData],
	)

	return (
		<BondedPoolsContext.Provider
			value={{
				queryBondedPool,
				getBondedPool,
				updateBondedPools,
				addToBondedPools,
				removeFromBondedPools,
				replacePoolRoles,
				poolSearchFilter: wrappedPoolSearchFilter,
				bondedPools,
				poolsMetaData,
				poolsNominations,
				updatePoolNominations,
				poolListActiveTab,
				setPoolListActiveTab,
			}}
		>
			{children}
		</BondedPoolsContext.Provider>
	)
}
