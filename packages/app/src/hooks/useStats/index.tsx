// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCalculator } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useEraStakers } from 'contexts/EraStakers'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useApi } from 'hooks/useApi'
import { useAverageRewardRate } from 'hooks/useAverageRewardRate'
import { useCurrency } from 'hooks/useCurrency'
import { useNetwork } from 'hooks/useNetwork'
import { useNextRewards } from 'hooks/useNextRewards'
import { useStakingMetrics } from 'hooks/useStakingMetrics'
import { useSupplyStaked } from 'hooks/useSupplyStaked'
import { type StatConfig, StatType } from 'library/Stats/types'
import { useTranslation } from 'react-i18next'
import { percentageOf } from 'ui-graphs/util'
import { useOverlay } from 'ui-overlay'
import { planckToUnitBn } from 'utils'
import type { StatKey } from './types'

type StatMap = Record<StatKey, StatConfig>
type StatPick<K extends StatKey> = Pick<StatMap, K>

export const useRewardOverviewStats = (
	isPreloading?: boolean,
): StatPick<'averageRewardRate' | 'rewardCalculator'> => {
	const { t } = useTranslation('pages')
	const { currency } = useCurrency()
	const { openModal } = useOverlay().modal
	const { getAverageRewardRate, formatRateAsPercent } = useAverageRewardRate()

	return {
		averageRewardRate: {
			id: 'averageRewardRate',
			type: StatType.TEXT,
			label: t('averageRewardRate'),
			value: formatRateAsPercent(getAverageRewardRate()),
			helpKey: 'Average Reward Rate',
			primary: true,
			isPreloading,
		},
		rewardCalculator: {
			id: 'rewardCalculator',
			type: StatType.BUTTON,
			Icon: (
				<FontAwesomeIcon
					icon={faCalculator}
					color="var(--gray-1000)"
					style={{ marginLeft: '0.25rem', height: '2.1rem' }}
				/>
			),
			label: t('useCustomAmount'),
			title: t('rewardsCalculator'),
			onClick: () =>
				openModal({
					key: 'RewardCalculator',
					size: 'xs',
					options: {
						currency,
					},
				}),
		},
	}
}

export const useSupplyStakedStat = (): StatPick<'supplyStaked'> => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { unit } = getStakingChainData(network)
	const { supplyString, supplyNumber } = useSupplyStaked()

	return {
		supplyStaked: {
			id: 'supplyStaked',
			type: StatType.PIE,
			label: t('unitSupplyStaked', { unit }),
			value: supplyString,
			unit: '%',
			pieValue: supplyNumber,
			tooltip: `${supplyString}%`,
			helpKey: 'Supply Staked',
		},
	}
}

export const useValidatorStats = (): StatPick<
	'activeValidators' | 'totalValidators' | 'averageCommission'
> => {
	const { t } = useTranslation('pages')
	const { activeValidators } = useEraStakers()
	const { avgCommission, validatorsFetched } = useValidators()
	const { validatorCount, counterForValidators, maxValidatorsCount } =
		useStakingMetrics()

	return {
		activeValidators: {
			id: 'activeValidators',
			type: StatType.PIE,
			label: t('activeValidators'),
			value: activeValidators,
			total: validatorCount,
			unit: '',
			pieValue: percentageOf(activeValidators, validatorCount),
			tooltip: `${
				validatorCount > 0
					? new BigNumber(activeValidators)
							.dividedBy(validatorCount * 0.01)
							.decimalPlaces(2)
							.toFormat()
					: '0'
			}%`,
			helpKey: 'Active Validator',
		},
		totalValidators: {
			id: 'totalValidators',
			type: StatType.PIE,
			label: t('totalValidators'),
			value: counterForValidators,
			total: maxValidatorsCount,
			unit: '',
			pieValue: maxValidatorsCount
				? percentageOf(counterForValidators, maxValidatorsCount)
				: 0,
			tooltip: `${
				maxValidatorsCount && maxValidatorsCount > 0
					? new BigNumber(counterForValidators / (maxValidatorsCount / 100))
							.decimalPlaces(2)
							.toFormat()
					: '0'
			}%`,
			helpKey: 'Validator',
		},
		averageCommission: {
			id: 'averageCommission',
			type: StatType.TEXT,
			label: t('averageCommission'),
			value: `${String(avgCommission)}%`,
			helpKey: 'Average Commission',
			// Avoid flashing a misleading "0%" before validator data has synced
			isPreloading: validatorsFetched !== 'synced',
		},
	}
}

export const usePoolStats = (
	isPreloading?: boolean,
): StatPick<'minimumToJoinPool' | 'activePools' | 'minimumToCreatePool'> => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { unit, units } = getStakingChainData(network)
	const {
		poolsConfig: { minJoinBond, counterForBondedPools, minCreateBond },
	} = useApi()

	return {
		minimumToJoinPool: {
			id: 'minimumToJoinPool',
			type: StatType.NUMBER,
			label: t('minimumToJoinPool'),
			value: parseFloat(planckToUnit(minJoinBond, units)),
			decimals: 3,
			unit: ` ${unit}`,
			helpKey: 'Minimum To Join Pool',
			isPreloading,
		},
		activePools: {
			id: 'activePools',
			type: StatType.NUMBER,
			label: t('activePools'),
			value: counterForBondedPools,
			unit: '',
			helpKey: 'Active Pools',
		},
		minimumToCreatePool: {
			id: 'minimumToCreatePool',
			type: StatType.NUMBER,
			label: t('minimumToCreatePool'),
			value: parseFloat(planckToUnit(minCreateBond, units)),
			decimals: 3,
			unit,
			helpKey: 'Minimum To Create Pool',
		},
	}
}

export const useNominatorStats = (): StatPick<
	'activeNominators' | 'minimumNominatorBond' | 'minimumActiveStake'
> => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { unit, units } = getStakingChainData(network)
	const { counterForNominators, minNominatorBond, minimumActiveStake } =
		useStakingMetrics()
	const { activeNominatorsCount } = useEraStakers()
	const minToEarnRewards = BigNumber.max(minNominatorBond, minimumActiveStake)

	return {
		activeNominators: {
			id: 'activeNominators',
			type: StatType.PIE,
			label: t('activeNominators'),
			value: activeNominatorsCount,
			total: counterForNominators,
			unit: '',
			pieValue:
				counterForNominators > 0
					? percentageOf(activeNominatorsCount, counterForNominators)
					: 0,
			tooltip: `${
				counterForNominators > 0
					? new BigNumber(
							percentageOf(activeNominatorsCount, counterForNominators),
						)
							.decimalPlaces(2)
							.toFormat()
					: '0'
			}%`,
			helpKey: 'Active Nominators',
		},
		minimumNominatorBond: {
			id: 'minimumNominatorBond',
			type: StatType.NUMBER,
			label: t('minimumToNominate'),
			value: parseFloat(planckToUnit(minNominatorBond, units)),
			decimals: 3,
			unit: `${unit}`,
			helpKey: 'Bonding',
		},
		minimumActiveStake: {
			id: 'minimumActiveStake',
			type: StatType.NUMBER,
			label: t('minimumToEarnRewards'),
			value: planckToUnitBn(minToEarnRewards, units).toNumber(),
			decimals: 3,
			unit: `${unit}`,
			helpKey: 'Bonding',
		},
	}
}

export const useStakeStats = (
	isPreloading?: boolean,
): StatPick<'averageRewardRate' | 'minimumToJoinPool' | 'nextReward'> => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { unit, units } = getStakingChainData(network)
	const {
		poolsConfig: { minJoinBond },
	} = useApi()
	const { formatted, timeleftResult, activeEra } = useNextRewards()
	const { getAverageRewardRate, formatRateAsPercent } = useAverageRewardRate()

	return {
		averageRewardRate: {
			id: 'averageRewardRate',
			type: StatType.TEXT,
			label: t('averageRewardRate'),
			value: formatRateAsPercent(getAverageRewardRate()),
			helpKey: 'Average Reward Rate',
			primary: true,
			isPreloading,
		},
		minimumToJoinPool: {
			id: 'minimumToJoinPool',
			type: StatType.NUMBER,
			label: t('minimumToJoinPool'),
			value: parseFloat(planckToUnit(minJoinBond, units)),
			decimals: 3,
			unit: ` ${unit}`,
			helpKey: 'Minimum To Join Pool',
			isPreloading,
		},
		nextReward: {
			id: 'nextReward',
			type: StatType.TIMELEFT,
			label: t('nextRewardDistribution'),
			timeleft: formatted,
			graph: {
				value1: activeEra.index === 0 ? 0 : timeleftResult.percentSurpassed,
				value2: activeEra.index === 0 ? 100 : timeleftResult.percentRemaining,
			},
			tooltip: `Era ${new BigNumber(activeEra.index).toFormat()}`,
			isPreloading,
		},
	}
}

export const useStats = (
	isPreloading?: boolean,
): Record<StatKey, StatConfig> => ({
	...useRewardOverviewStats(isPreloading),
	...useSupplyStakedStat(),
	...useValidatorStats(),
	...usePoolStats(isPreloading),
	...useNominatorStats(),
	...useStakeStats(isPreloading),
})
