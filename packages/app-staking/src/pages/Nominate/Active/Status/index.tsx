// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { CardWrapper } from 'library/Card/Wrappers'
import { Separator } from 'ui-core/base'
import { NewNominator } from './NewNominator'
import { NominationStatus } from './NominationStatus'
import { PayoutDestinationStatus } from './PayoutDestinationStatus'
import { UnclaimedPayoutsStatus } from './UnclaimedPayoutsStatus'

export const Status = ({ height }: { height: number }) => {
	const { syncing } = useSyncing()
	const { isBonding } = useStaking()
	const { activeAddress } = useActiveAccount()
	const { isReadOnlyAccount } = useImportedAccounts()

	return (
		<CardWrapper
			height={height}
			className={!syncing && !isBonding ? 'prompt' : undefined}
		>
			<NominationStatus />
			<Separator />
			<UnclaimedPayoutsStatus />

			{!syncing ? (
				isBonding ? (
					<>
						<Separator />
						<PayoutDestinationStatus />
					</>
				) : (
					<>
						<Separator transparent />
						{!isReadOnlyAccount(activeAddress) && (
							<NewNominator syncing={syncing} />
						)}
					</>
				)
			) : (
				<>
					<Separator transparent />
					<NewNominator syncing={syncing} />
				</>
			)}
		</CardWrapper>
	)
}
