// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowUpRightDots } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Odometer } from '@w3ux/react-odometer'
import { useHelp } from 'hooks/useHelp'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { Stat } from 'ui-core/base'
import type { TickerProps } from './types'
import { Wrapper } from './Wrapper'

export const Ticker = ({
	label,
	value,
	helpKey,
	direction,
	primary,
	unit,
	changePercent,
	isPreloading,
}: TickerProps) => {
	const { openHelpTooltip } = useHelp()
	const tickerColor =
		direction === 'up'
			? 'var(--status-success)'
			: direction === 'down'
				? 'var(--status-danger)'
				: 'var(--gray-900)'

	return (
		<Wrapper isPreloading={isPreloading}>
			<Stat.Card>
				<div>
					<Stat.Graphic>
						<FontAwesomeIcon
							icon={faArrowUpRightDots}
							transform="grow-8"
							color="var(--gray-1000)"
						/>
					</Stat.Graphic>
					<Stat.Content>
						<Stat.Title primary={primary}>
							<Odometer value={value} />
							{unit}
							<label
								style={{
									color: tickerColor,
								}}
							>
								{direction === 'up' && '+'}
								{changePercent}%
							</label>
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
