// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn } from '@w3ux/utils'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { getIdentityDisplay } from 'library/List/Utils'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Identity as Wrapper } from 'ui-core/list'
import type { IdentityProps } from '../types'

export const Identity = ({ address }: IdentityProps) => {
	const { validatorIdentities, validatorSupers, validatorsFetched } =
		useValidators()

	const [display, setDisplay] = useState<ReactNode>(
		getIdentityDisplay(validatorIdentities[address], validatorSupers[address])
			.node,
	)

	useEffect(() => {
		setDisplay(
			getIdentityDisplay(validatorIdentities[address], validatorSupers[address])
				.node,
		)
	}, [validatorSupers, validatorIdentities, address])

	const polkiconSize = '2rem'

	return (
		<Wrapper>
			<div
				style={{
					minWidth: polkiconSize,
					maxWidth: polkiconSize,
					/* Safari fix */
					border: '0.1rem solid transparent',
				}}
			>
				<Polkicon address={address} fontSize={polkiconSize} />
			</div>
			<div>
				{validatorsFetched && display !== null ? (
					<h4>{display}</h4>
				) : (
					<h4>{ellipsisFn(address, 6)}</h4>
				)}
			</div>
		</Wrapper>
	)
}
