// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowUpRightDots } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Odometer } from '@w3ux/react-odometer'
import { useHelp } from 'hooks/useHelp'
import { Stat } from 'ui-app/Stat'
import { ButtonHelp } from 'ui-buttons'
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
	const titleText = `${value}${unit}${direction === 'up' ? '+' : ''}${changePercent}%`

	return (
		<Wrapper isPreloading={isPreloading}>
			<Stat.Card>
				<Stat.Graphic>
					<FontAwesomeIcon
						icon={faArrowUpRightDots}
						transform="grow-8"
						color="var(--gray-1000)"
					/>
				</Stat.Graphic>
				<Stat.Content>
					<Stat.Title text={titleText} primary={primary}>
						<Odometer value={value} />
						{unit}
						<label style={{ color: tickerColor }}>
							{direction === 'up' && '+'}
							{changePercent}%
						</label>
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
