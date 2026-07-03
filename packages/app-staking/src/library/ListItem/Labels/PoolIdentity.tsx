// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn } from '@w3ux/utils'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { determinePoolDisplay } from 'contexts/Pools/util'
import { Identity } from 'ui-core/list'
import type { PoolIdentityProps } from '../types'

export const PoolIdentity = ({
	pool: { addresses, id },
}: PoolIdentityProps) => {
	const { poolsMetaData } = useBondedPools()
	const metadataSynced = Object.values(poolsMetaData).length > 0 || false

	const display = determinePoolDisplay(
		addresses.stash,
		poolsMetaData[Number(id)],
	)

	const polkiconSize = '2rem'

	return (
		<Identity>
			<div style={{ maxWidth: polkiconSize }}>
				<Polkicon address={addresses.stash} fontSize={polkiconSize} />
			</div>
			<div>
				{!metadataSynced ? (
					<h4>{ellipsisFn(addresses.stash)}</h4>
				) : (
					<h4>{display}</h4>
				)}
			</div>
		</Identity>
	)
}
