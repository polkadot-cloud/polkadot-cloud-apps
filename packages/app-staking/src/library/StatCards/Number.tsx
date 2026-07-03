// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Odometer } from '@w3ux/react-odometer'
import BigNumber from 'bignumber.js'
import { useHelp } from 'hooks/useHelp'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { Stat } from 'ui-core/base'
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
	return (
		<Wrapper isPreloading={isPreloading}>
			<Stat.Card>
				<div>
					<Stat.Content>
						<Stat.Title>
							<Odometer
								value={new BigNumber(value)
									.decimalPlaces(decimals || 0)
									.toFormat()}
							/>
							{unit}
						</Stat.Title>
						<Stat.Subtitle>
							{label}
							{helpKey !== undefined ? (
								<ButtonHelpTooltip
									marginLeft
									definition={helpKey}
									openHelp={openHelpTooltip}
								/>
							) : null}
						</Stat.Subtitle>
					</Stat.Content>
				</div>
			</Stat.Card>
		</Wrapper>
	)
}
