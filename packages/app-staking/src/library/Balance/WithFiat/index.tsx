// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Odometer } from '@w3ux/react-odometer'
import { minDecimalPlaces } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import type { ReactNode } from 'react'
import { CardLabel, TokenFiat } from 'ui-core/base'
import { Value } from '../Value'

export const WithFiat = ({
	Token,
	value,
	currency,
	label,
	caretAsUnit = false,
}: {
	Token: ReactNode
	value: number
	currency: string
	label?: ReactNode
	caretAsUnit?: boolean
}) => {
	const { network } = useNetwork()
	const { units } = getStakingChainData(network)

	const valueFormatted =
		String(value) === '0' ? 0 : new BigNumber(value).toFormat(units)
	const labelDisplay = caretAsUnit ? (
		value > 0 ? (
			<FontAwesomeIcon icon={faCaretUp} color="var(--status-success)" />
		) : value < 0 ? (
			<FontAwesomeIcon icon={faCaretDown} color="var(--status-danger)" />
		) : null
	) : (
		label
	)

	// Show token balance with fiat value
	return (
		<TokenFiat Token={Token}>
			<h1>
				<Odometer
					value={minDecimalPlaces(valueFormatted, 2)}
					zeroDecimals={2}
				/>
				{labelDisplay && <CardLabel>{labelDisplay}</CardLabel>}
			</h1>
			<h3>
				<Value tokenBalance={valueFormatted} currency={currency} />
			</h3>
		</TokenFiat>
	)
}
