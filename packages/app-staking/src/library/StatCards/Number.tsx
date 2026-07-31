// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Odometer } from '@w3ux/react-odometer'
import BigNumber from 'bignumber.js'
import { useHelp } from 'hooks/useHelp'
import { Stat } from 'ui-app/Stat'
import { ButtonHelp } from 'ui-buttons'
import type { NumberProps } from './types'
import { Wrapper } from './Wrapper'

export const Number = ({
	label,
	value,
	unit,
	helpKey,
	decimals,
	isPreloading = false,
}: NumberProps) => {
	const { openHelpTooltip } = useHelp()
	const displayValue = new BigNumber(value)
		.decimalPlaces(decimals ?? 0)
		.toFormat()

	return (
		<Wrapper isPreloading={isPreloading}>
			<Stat.Card>
				<Stat.Content>
					<Stat.Title text={`${displayValue}${unit}`}>
						<Odometer value={displayValue} />
						{unit}
					</Stat.Title>
					<Stat.Subtitle text={label}>
						{helpKey !== undefined ? (
							<ButtonHelp
								marginLeft
								definition={helpKey}
								openHelp={openHelpTooltip}
							/>
						) : null}
					</Stat.Subtitle>
				</Stat.Content>
			</Stat.Card>
		</Wrapper>
	)
}
