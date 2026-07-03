// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from 'hooks/useHelp'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { Countdown } from 'library/Countdown'
import { Badge, Stat } from 'ui-core/base'
import { Pie } from 'ui-graphs'
import type { TimeleftProps } from './types'
import { Wrapper } from './Wrapper'

export const Timeleft = ({
	label,
	timeleft,
	graph,
	tooltip,
	helpKey,
	isPreloading,
}: TimeleftProps) => {
	const { openHelpTooltip } = useHelp()
	return (
		<Wrapper isPreloading={isPreloading}>
			<Stat.Card>
				<div>
					<Stat.Graphic>
						<Pie value={Number(graph.value1.toFixed(1))} size="3.2rem" />
					</Stat.Graphic>
					{tooltip && (
						<label>
							<h3>{tooltip}</h3>
						</label>
					)}
					<Stat.Content>
						<Badge.Inner>
							<Countdown timeleft={timeleft} />
						</Badge.Inner>
						<Stat.Subtitle>
							{label}{' '}
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
