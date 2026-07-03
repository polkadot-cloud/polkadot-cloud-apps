// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import type { CountdownProps } from './types'

export const Countdown = ({ timeleft, markup = true }: CountdownProps) => {
	const { t } = useTranslation('app')
	const { days, hours, minutes, seconds } = timeleft

	const secondsNumber = seconds ? seconds[0] : 0
	const secondsLabel = seconds
		? seconds[1]
		: t('second', { count: secondsNumber })

	if (markup) {
		return (
			<>
				{days[0] > 0 ? (
					<>
						{days[0]} <span>{days[1]}</span>
					</>
				) : null}
				{hours[0] > 0 ? (
					<>
						{hours[0]} <span>{hours[1]}</span>
					</>
				) : null}
				{minutes[0] > 0 ? (
					<>
						{minutes[0]} <span>{minutes[1]}</span>
					</>
				) : null}
				{days[0] === 0 && hours[0] === 0 && minutes[0] > 0 ? (
					<>:&nbsp; </>
				) : null}

				{days[0] === 0 && hours[0] === 0 && (
					<>
						{secondsNumber}
						{minutes[0] === 0 ? <span>{secondsLabel}</span> : null}
					</>
				)}
			</>
		)
	}

	return (
		<>
			{days[0] > 0 ? `${days[0]} ${days[1]} ` : null}
			{hours[0] > 0 ? `${hours[0]} ${hours[1]} ` : null}
			{minutes[0] > 0 ? `${minutes[0]} ${minutes[1]} ` : null}
			{days[0] === 0 && hours[0] === 0
				? `${secondsNumber} ${minutes[0] === 0 ? secondsLabel : ''}`
				: null}
		</>
	)
}
