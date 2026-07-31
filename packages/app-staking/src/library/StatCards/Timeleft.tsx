// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from 'hooks/useHelp'
import { Countdown } from 'library/Countdown'
import { Stat } from 'ui-app/Stat'
import { ButtonHelp } from 'ui-buttons'
import { Badge } from 'ui-core/base'
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
				<Stat.Graphic>
					<Pie value={Number(graph.value1.toFixed(1))} size="3.2rem" />
				</Stat.Graphic>
				{tooltip && <Stat.Tooltip>{tooltip}</Stat.Tooltip>}
				<Stat.Content>
					<Badge.Inner>
						<Countdown timeleft={timeleft} />
					</Badge.Inner>
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
