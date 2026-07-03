// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter, planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { MaxNominations } from 'consts'
import {
	getRelayChainData,
	getStakingChain,
	getStakingChainData,
} from 'consts/util'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { useStakingMetrics } from 'hooks/useStakingMetrics'
import type { AnyJson } from 'types'
import { planckToUnitBn } from 'utils'

export const useFillVariables = () => {
	const {
		getConsts,
		getChainSpec,
		poolsConfig: { minJoinBond, minCreateBond },
	} = useApi()
	const { minimumActiveStake, minNominatorBond } = useStakingMetrics()
	const { network } = useNetwork()
	const { maxSupportedDays } = useErasPerDay()
	const { maxExposurePageSize } = getConsts(network)
	const { existentialDeposit } = getChainSpec(getStakingChain(network))
	const { name } = getRelayChainData(network)
	const { unit, units } = getStakingChainData(network)
	const minToEarnRewards = new BigNumber(
		planckToUnit(
			BigNumber.max(minNominatorBond, minimumActiveStake).toString(),
			units,
		),
	)

	const fillVariables = (d: AnyJson, keys: string[]) => {
		// biome-ignore lint/suspicious/noExplicitAny: <>
		const fields: [string, any][] = Object.entries(d).filter(([k]) =>
			keys.includes(k),
		)
		const transformed = Object.entries(fields).map(([, [key, val]]) => {
			const varsToValues = [
				['{AVERAGE_REWARD_RATE_DAYS}', maxSupportedDays > 30 ? '30' : '15'],
				['{NETWORK_UNIT}', unit],
				['{NETWORK_NAME}', capitalizeFirstLetter(name)],
				['{MAX_EXPOSURE_PAGE_SIZE}', maxExposurePageSize.toString()],
				['{MAX_NOMINATIONS}', MaxNominations],
				['{MIN_ACTIVE_STAKE}', minToEarnRewards.decimalPlaces(3).toFormat()],
				[
					'{MIN_POOL_JOIN_BOND}',
					new BigNumber(planckToUnit(minJoinBond, units))
						.decimalPlaces(3)
						.toFormat(),
				],
				[
					'{MIN_POOL_CREATE_BOND}',
					new BigNumber(planckToUnit(minCreateBond, units))
						.decimalPlaces(3)
						.toFormat(),
				],
				[
					'{EXISTENTIAL_DEPOSIT}',
					planckToUnitBn(new BigNumber(existentialDeposit), units).toFormat(),
				],
			]

			if (val) {
				for (const varToVal of varsToValues) {
					if (val?.constructor === Array) {
						val = val.map((_d) => _d.replaceAll(varToVal[0], varToVal[1]))
					} else {
						val = val.replaceAll(varToVal[0], varToVal[1])
					}
				}
			}
			return [key, val]
		})

		return {
			...d,
			...Object.fromEntries(transformed),
		}
	}

	return {
		fillVariables,
	}
}
