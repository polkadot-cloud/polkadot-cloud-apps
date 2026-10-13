// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { getStakingChainData } from 'consts/util'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useSyncing } from 'hooks/useSyncing'
import { useValidators } from 'hooks/useValidators'
import { useRewards } from 'plugin-staking-api'
import { getValidatorRewardProjection } from './util'

// Share the same account/network/era-scoped projection between the overview and calculator.
export const useValidatorRewardProjection = () => {
	const { network } = useNetwork()
	const { activeEra } = useApi()
	const { erasPerDay } = useErasPerDay()
	const { activeAddress } = useActiveAccount()
	const { accountsInitialised } = useImportedAccounts()
	const { syncing, accountSynced } = useSyncing([
		'initialization',
		'staking-ledgers',
	])
	const { pluginEnabled } = usePlugins()
	const { isValidator, isLoading } = useValidators()
	const { units } = getStakingChainData(network)
	const accountIsValidator = isValidator(activeAddress)
	const stakingApiEnabled = pluginEnabled('staking_api')
	const enabled = Boolean(
		accountIsValidator &&
			activeAddress &&
			stakingApiEnabled &&
			activeEra.index > 0 &&
			erasPerDay > 0,
	)
	const { data, loading, error } = useRewards({
		network,
		who: activeAddress || '',
		fromEra: Math.max(activeEra.index - 1, 0),
		skip: !enabled,
	})

	return {
		...getValidatorRewardProjection(
			enabled ? data.allRewards : [],
			activeAddress,
			activeEra.index,
			erasPerDay,
			units,
		),
		accountIsValidator,
		loading:
			!accountsInitialised ||
			syncing ||
			Boolean(activeAddress && !accountSynced(activeAddress)) ||
			isLoading(activeAddress) ||
			(accountIsValidator && stakingApiEnabled && (!enabled || loading)),
		unavailable: accountIsValidator && (!stakingApiEnabled || Boolean(error)),
	}
}
