// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getRelayChainConsts } from 'consts/util'
import { intervalToDuration } from 'date-fns'
import { useNetwork } from 'hooks/useNetwork'
import { MinDelayInput } from 'library/Form/MinDelayInput'
import { StyledSlider } from 'library/StyledSlider'
import { SliderWrapper } from 'modals/ManagePool/Wrappers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChangeRateInput } from '../types'
import { usePoolCommission } from './provider'

export const ChangeRate = () => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { initial, current, enabled, setChangeRate } = usePoolCommission()
	const { expectedBlockTime } = getRelayChainConsts(network)

	// Get the current change rate value.
	const { changeRate } = current

	// Convert a block number into an estimated change rate duration.
	const minDelayToInput = (delay: number) => {
		const milliseconds = expectedBlockTime * BigInt(delay)
		const end = milliseconds === 0n ? 0 : Number(milliseconds)
		const { years, months, days, hours, minutes } = intervalToDuration({
			start: 0,
			end,
		})

		return {
			years: years || 0,
			months: months || 0,
			days: days || 0,
			hours: hours || 0,
			minutes: minutes || 0,
		}
	}

	// Convert the estimated change duration into a block number
	const inputToMinDelay = (input: ChangeRateInput) => {
		const { years, months, days, hours, minutes } = input

		// calculate number of seconds from changeRateInput
		const yearsSeconds = new BigNumber(years).multipliedBy(31536000)
		const monthsSeconds = new BigNumber(months).multipliedBy(2628288)
		const daysSeconds = new BigNumber(days).multipliedBy(86400)
		const hoursSeconds = new BigNumber(hours).multipliedBy(3600)
		const minutesSeconds = new BigNumber(minutes).multipliedBy(60)

		return yearsSeconds
			.plus(monthsSeconds)
			.plus(daysSeconds)
			.plus(hoursSeconds)
			.plus(minutesSeconds)
			.dividedBy(expectedBlockTime / 1000n)
			.integerValue()
			.toNumber()
	}

	// Store the change rate value in input format.
	const [changeRateInput, setChangeRateInput] = useState<ChangeRateInput>(
		minDelayToInput(changeRate.minDelay),
	)

	// Handle an update to the change rate input.
	const handleChangeRateInput = (field: string, value: number) => {
		const newChangeRateInput = {
			...changeRateInput,
			[field]: value,
		}
		setChangeRateInput(newChangeRateInput)
		setChangeRate({
			...changeRate,
			minDelay: inputToMinDelay(newChangeRateInput),
		})
	}

	// Determine whether the change rate values have been updated.
	const maxIncreaseUpdated =
		changeRate.maxIncrease !== initial.changeRate.maxIncrease

	const minDelayUpdated = changeRate.minDelay !== initial.changeRate.minDelay

	// Determine the max increase feedback to display.
	const maxIncreaseFeedback = (() => {
		if (!maxIncreaseUpdated) {
			return undefined
		}
		return {
			text: t('updated'),
			label: 'neutral',
		}
	})()

	// Determine the min delay feedback to display.
	const minDelayFeedback = minDelayUpdated
		? {
				text: t('updated'),
				label: 'neutral',
			}
		: undefined

	return (
		enabled.changeRate && (
			<SliderWrapper>
				<div>
					<h2>{changeRate.maxIncrease}% </h2>
					<h5 className={maxIncreaseFeedback?.label || 'neutral'}>
						{!!maxIncreaseFeedback && maxIncreaseFeedback.text}
					</h5>
				</div>

				<StyledSlider
					value={changeRate.maxIncrease}
					step={0.1}
					onChange={(val) => {
						if (typeof val === 'number') {
							setChangeRate({
								...changeRate,
								maxIncrease: val,
							})
						}
					}}
				/>

				<h5 style={{ marginTop: '1rem' }}>
					{t('minDelayBetweenUpdates')}
					{minDelayFeedback && (
						<span className={minDelayFeedback?.label || 'neutral'}>
							{minDelayFeedback.text}
						</span>
					)}
				</h5>
				<div className="changeRate">
					<MinDelayInput
						initial={changeRateInput.years}
						field="years"
						label={t('years')}
						handleChange={handleChangeRateInput}
					/>
					<MinDelayInput
						initial={changeRateInput.months}
						field="months"
						label={t('months')}
						handleChange={handleChangeRateInput}
					/>
					<MinDelayInput
						initial={changeRateInput.days}
						field="days"
						label={t('days')}
						handleChange={handleChangeRateInput}
					/>
					<MinDelayInput
						initial={changeRateInput.hours}
						field="hours"
						label={t('hours')}
						handleChange={handleChangeRateInput}
					/>
					<MinDelayInput
						initial={changeRateInput.minutes}
						field="minutes"
						label={t('minutes')}
						handleChange={handleChangeRateInput}
					/>
				</div>
				<p>
					{t('thisMinimumDelay', {
						count: changeRate.minDelay,
					})}
				</p>
			</SliderWrapper>
		)
	)
}
