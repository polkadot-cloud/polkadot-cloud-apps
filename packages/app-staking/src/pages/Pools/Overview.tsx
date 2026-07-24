// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActivePool } from 'hooks/useActivePool'
import { useNetwork } from 'hooks/useNetwork'
import { BondManager } from 'library/BondManager'
import { CardWrapper } from 'library/Card/Wrappers'
import { WithdrawPrompt } from 'library/WithdrawPrompt'
import { Page } from 'ui-core/base'
import { ClosurePrompts } from './ClosurePrompts'
import { ManagePool } from './ManagePool'
import { PoolShares } from './PoolShares'
import { PoolStats } from './PoolStats'
import { Roles } from './Roles'
import { Status } from './Status'

export const PoolOverview = ({
	isPreloading,
	showOtherOptions,
}: {
	isPreloading?: boolean
	showOtherOptions?: boolean
}) => {
	const { network } = useNetwork()
	const { getPoolRoles, activePool } = useActivePool()
	const ROW_HEIGHT = 220

	return (
		<>
			<ClosurePrompts />
			<WithdrawPrompt bondFor="pool" />
			<Page.Row>
				<Page.RowSection secondary vLast>
					<CardWrapper height={ROW_HEIGHT}>
						<BondManager bondFor="pool" isPreloading={isPreloading} />
					</CardWrapper>
				</Page.RowSection>
				<Page.RowSection hLast>
					<Status
						height={ROW_HEIGHT}
						isPreloading={isPreloading}
						showOtherOptions={showOtherOptions}
					/>
				</Page.RowSection>
			</Page.Row>
			{network === 'polkadot' && <PoolShares />}
			{activePool !== undefined && (
				<>
					<ManagePool />
					<Page.Row>
						<CardWrapper>
							<Roles defaultRoles={getPoolRoles()} />
						</CardWrapper>
					</Page.Row>
					<Page.Row>
						<PoolStats />
					</Page.Row>
				</>
			)}
		</>
	)
}
