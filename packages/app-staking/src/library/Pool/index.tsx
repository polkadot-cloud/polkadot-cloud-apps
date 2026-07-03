// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { PerbillMultiplier } from 'consts'
import { usePoolCommission } from 'hooks/usePoolCommission'
import { useSyncing } from 'hooks/useSyncing'
import { FavoritePool } from 'library/ListItem/Buttons/FavoritePool'
import { PoolMembers } from 'library/ListItem/Buttons/PoolMembers'
import { ShareLink } from 'library/ListItem/Buttons/ShareLink'
import { PoolBonded } from 'library/ListItem/Labels/PoolBonded'
import { PoolCommission } from 'library/ListItem/Labels/PoolCommission'
import { PoolIdentity } from 'library/ListItem/Labels/PoolIdentity'
import { PoolNominateStatus } from 'library/ListItem/Labels/PoolNominateStatus'
import { Wrapper } from 'library/ListItem/Wrappers'
import { usePoolsTabs } from 'pages/PoolsList/context'
import { HeaderButtonRow, LabelRow, Separator } from 'ui-core/list'
import { PoolMetrics } from '../ListItem/Buttons/PoolMetrics'
import { Members } from '../ListItem/Labels/Members'
import { PoolId } from '../ListItem/Labels/PoolId'
import type { PoolProps } from './types'

export const Pool = ({ pool }: PoolProps) => {
	const { memberCounter, addresses, id } = pool
	const { setActiveTab } = usePoolsTabs()
	const { syncing } = useSyncing(['active-pools'])
	const { getCurrentCommission } = usePoolCommission()

	const currentCommission = getCurrentCommission(id)

	return (
		<Wrapper className="pool">
			<div className="inner">
				<div className="row top">
					<PoolIdentity pool={pool} />
					<div>
						<HeaderButtonRow>
							<ShareLink paramKey="p" paramValue={String(id)} />
							<FavoritePool address={addresses.stash} />
							<PoolMembers pool={pool} memberCounter={memberCounter} />
							<PoolMetrics
								pool={pool}
								setActiveTab={setActiveTab}
								disabled={syncing}
							/>
						</HeaderButtonRow>
					</div>
				</div>
				<Separator />
				<div className="row bottom lg pools">
					<div>
						<PoolNominateStatus pool={pool} />
					</div>
					<div>
						<LabelRow>
							{currentCommission > 0 && (
								<PoolCommission
									commission={`${new BigNumber(currentCommission / PerbillMultiplier).decimalPlaces(3).toFormat()}%`}
								/>
							)}
							<PoolId id={id} />
							<Members memberCounter={memberCounter} />
							<PoolBonded pool={pool} />
						</LabelRow>
					</div>
				</div>
			</div>
		</Wrapper>
	)
}
