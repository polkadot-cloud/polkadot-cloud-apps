// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Odometer } from '@w3ux/react-odometer'
import BigNumber from 'bignumber.js'
import { useHelp } from 'hooks/useHelp'
import { Stat } from 'ui-app/Stat'
import { ButtonHelp } from 'ui-buttons'
import { Pie as PieGraph } from 'ui-graphs'
import type { PieProps } from './types'
import { Wrapper } from './Wrapper'

export const Pie = ({
	label,
	stat,
	pieValue,
	tooltip,
	helpKey,
	isPreloading,
}: PieProps) => {
	const { openHelpTooltip } = useHelp()
	const showTotal = !!stat.total
	const displayValue = new BigNumber(stat.value).toFormat()
	const displayTotal = new BigNumber(stat.total || 0).toFormat()
	const titleText = `${displayValue}${stat.unit}${
		showTotal ? `/${displayTotal}${stat.unit}` : ''
	}`

	return (
		<Wrapper isPreloading={isPreloading}>
			<Stat.Card>
				<Stat.Graphic>
					<PieGraph value={pieValue} size="3.2rem" />
				</Stat.Graphic>
				{tooltip && <Stat.Tooltip>{tooltip}</Stat.Tooltip>}
				<Stat.Content>
					<Stat.Title text={titleText}>
						<Odometer value={displayValue} />
						{stat.unit}
						{showTotal ? (
							<Stat.Total>
								/&nbsp;
								<Odometer value={displayTotal} />
								{stat.unit}
							</Stat.Total>
						) : null}
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
