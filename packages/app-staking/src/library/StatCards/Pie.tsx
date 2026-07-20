// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Odometer } from '@w3ux/react-odometer'
import BigNumber from 'bignumber.js'
import { useHelp } from 'hooks/useHelp'
import { ButtonHelp } from 'ui-buttons'
import { Stat } from 'ui-core/base'
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
	const showTotal = !!stat?.total
	const { openHelpTooltip } = useHelp()
	return (
		<Wrapper isPreloading={isPreloading}>
			<Stat.Card>
				<div>
					<Stat.Graphic>
						<PieGraph value={pieValue} size="3.2rem" />
					</Stat.Graphic>
					{tooltip && (
						<label>
							<h3>{tooltip}</h3>
						</label>
					)}
					<Stat.Content>
						<Stat.Title>
							<Odometer value={new BigNumber(stat.value).toFormat()} />
							{stat?.unit && stat.unit}
							{showTotal ? (
								<Stat.Total>
									/&nbsp;
									<Odometer
										value={new BigNumber(stat?.total || 0).toFormat()}
									/>
									{stat?.unit || null}
								</Stat.Total>
							) : null}
						</Stat.Title>
						<Stat.Subtitle>
							{label}{' '}
							{helpKey !== undefined ? (
								<ButtonHelp
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
