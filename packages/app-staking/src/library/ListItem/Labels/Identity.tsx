// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn } from '@w3ux/utils'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useTheme } from 'hooks/useTheme'
import { getIdentityDisplay } from 'library/List/Utils'
import { Tooltip } from 'ui-core/base'
import { Identity as Wrapper } from 'ui-core/list'
import type { IdentityProps } from '../types'

export const Identity = ({
	address,
	display: displayOverride,
	size = 'default',
}: IdentityProps) => {
	const { themeElementRef } = useTheme()
	const { validatorIdentities, validatorSupers, validatorsFetched } =
		useValidators(displayOverride === undefined ? [address] : [])
	const display =
		displayOverride === undefined
			? getIdentityDisplay(
					validatorIdentities[address],
					validatorSupers[address],
				).node
			: displayOverride
	const identityFetched =
		displayOverride !== undefined || validatorsFetched === 'synced'
	const hasIdentity = identityFetched && display !== null
	const large = size === 'large'
	const polkiconSize = large ? '2.75rem' : '2.2rem'

	return (
		<Wrapper large={large}>
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
				<Tooltip
					align="start"
					container={themeElementRef.current || undefined}
					side="top"
					text={hasIdentity ? display : address}
				>
					{/* biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need access to the full identity tooltip. */}
					<h4 tabIndex={0}>{hasIdentity ? display : ellipsisFn(address, 6)}</h4>
				</Tooltip>
			</div>
		</Wrapper>
	)
}
