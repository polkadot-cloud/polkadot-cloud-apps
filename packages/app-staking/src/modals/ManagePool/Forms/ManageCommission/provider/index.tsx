// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { createContext, useContext, useEffect, useState } from 'react'
import type { MaybeAddress } from 'types'
import { perbillToPercent } from 'utils'
import { defaultPoolCommissionContext } from './defaults'
import type {
	ChangeRateInput,
	OptionalCommissionFeature,
	PoolCommissionContextInterface,
	PoolCommissionProviderProps,
} from './types'

export const PoolCommissionContext =
	createContext<PoolCommissionContextInterface>(defaultPoolCommissionContext)

export const usePoolCommission = () => useContext(PoolCommissionContext)

export const PoolCommissionProvider = ({
	children,
}: PoolCommissionProviderProps) => {
	const {
		poolsConfig: { globalMaxCommission },
	} = useApi()
	const { activePool } = useActivePool()
	const { getBondedPool } = useBondedPools()
	const poolId = activePool?.id || 0
	const bondedPool = getBondedPool(poolId)
	const globalMaxCommissionUnit =
		perbillToPercent(globalMaxCommission).toNumber()

	// Get initial commission value from the bonded pool commission config.
	const initialCommission = perbillToPercent(
		bondedPool?.commission?.current?.[0] || 0,
	).toNumber()

	// Get initial payee value from the bonded pool commission config.
	const initialPayee = bondedPool?.commission?.current?.[1] || null

	// Get initial maximum commission value from the bonded pool commission config.
	const initialMaxCommission = Math.min(
		bondedPool?.commission?.max
			? perbillToPercent(bondedPool.commission.max).toNumber()
			: globalMaxCommissionUnit,
		globalMaxCommissionUnit,
	)

	// Get initial change rate value from the bonded pool commission config.
	const initialChangeRate = ((): ChangeRateInput => {
		const raw = bondedPool?.commission?.changeRate
		return raw
			? {
					maxIncrease: perbillToPercent(raw.maxIncrease).toNumber(),
					minDelay: Number(raw.minDelay),
				}
			: {
					maxIncrease: 10,
					minDelay: 0,
				}
	})()
	const initialHasValue = {
		maxCommission: !!bondedPool?.commission?.max,
		changeRate: !!bondedPool?.commission?.changeRate,
	}

	// Store the commission payee.
	const [payee, setPayee] = useState<MaybeAddress>(initialPayee)

	// Store the current commission value.
	const [commission, setCommission] = useState<number>(initialCommission)

	// Store the maximum commission value.
	const [maxCommission, setMaxCommission] =
		useState<number>(initialMaxCommission)

	// Store the commission change rate value.
	const [changeRate, setChangeRate] =
		useState<ChangeRateInput>(initialChangeRate)

	// Whether max commission has been enabled.
	const [maxCommissionEnabled, setMaxCommissionEnabled] = useState<boolean>(
		initialHasValue.maxCommission,
	)

	// Whether change rate has been enabled.
	const [changeRateEnabled, setChangeRateEnabled] = useState<boolean>(
		initialHasValue.changeRate,
	)

	const initial = {
		commission: initialCommission,
		payee: initialPayee,
		maxCommission: initialMaxCommission,
		changeRate: initialChangeRate,
	}

	const current = {
		commission,
		payee,
		maxCommission,
		changeRate,
	}

	const enabled = {
		maxCommission: maxCommissionEnabled,
		changeRate: changeRateEnabled,
	}

	const hasValue = initialHasValue

	const updated = {
		commission: commission !== initial.commission,
		payee: payee !== initial.payee,
		maxCommission:
			maxCommission !== initial.maxCommission ||
			(!hasValue.maxCommission && enabled.maxCommission),
		changeRate:
			changeRate.maxIncrease !== initial.changeRate.maxIncrease ||
			changeRate.minDelay !== initial.changeRate.minDelay ||
			(!hasValue.changeRate && enabled.changeRate),
	}

	// Reset all values to their initial (current) values.
	const resetAll = (): void => {
		setCommission(initial.commission)
		setPayee(initial.payee)
		setMaxCommission(initial.maxCommission)
		setChangeRate(initial.changeRate)
		setMaxCommissionEnabled(initialHasValue.maxCommission)
		setChangeRateEnabled(initialHasValue.changeRate)
	}

	const setFeatureEnabled = (
		feature: OptionalCommissionFeature,
		isEnabled: boolean,
	): void => {
		switch (feature) {
			case 'maxCommission':
				setMaxCommissionEnabled(isEnabled)
				break
			case 'changeRate':
				setChangeRateEnabled(isEnabled)
				break
			default:
		}
	}

	// Reset all values to their initial (current) values when bonded pool changes.
	useEffect(() => {
		resetAll()
	}, [bondedPool])

	return (
		<PoolCommissionContext.Provider
			value={{
				setCommission,
				setPayee,
				setMaxCommission,
				setChangeRate,
				setFeatureEnabled,
				initial,
				current,
				enabled,
				hasValue,
				updated,
				resetAll,
			}}
		>
			{children}
		</PoolCommissionContext.Provider>
	)
}
