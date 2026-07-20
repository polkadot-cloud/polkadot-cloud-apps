// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import type { TooltipItem } from 'chart.js'
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { format, fromUnixTime } from 'date-fns'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Spinner } from 'ui-core/base'
import type { PayoutBarProps } from '../types'
import {
	buildPoolShareAnnotations,
	formatRewardsForGraphs,
} from '../util/index'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	annotationPlugin,
)

export const PayoutBar = ({
	days,
	height,
	data: { payouts, poolClaims, unclaimedPayouts, poolShareRewards },
	nominating,
	inPool,
	syncing,
	getThemeValue,
	unit,
	units,
	dateFormat,
	labels,
	activeAccount,
}: PayoutBarProps) => {
	const staking = nominating || inPool

	// Memoize current date, updating daily when the day changes
	const currentDate = useMemo(() => new Date(), [])

	// Get formatted rewards data
	const { allPayouts, allPoolClaims, allUnclaimedPayouts } =
		formatRewardsForGraphs(
			currentDate,
			days,
			units,
			payouts,
			poolClaims,
			unclaimedPayouts,
		)
	const { p: graphPayouts } = allPayouts
	const { p: graphUnclaimedPayouts } = allUnclaimedPayouts
	const { p: graphPoolClaims } = allPoolClaims

	// Determine color for payouts
	const colorPayouts = !staking
		? getThemeValue('--gray-500')
		: getThemeValue('--gray-1000')

	// Determine color for poolClaims
	const colorPoolClaims = !staking
		? getThemeValue('--gray-500')
		: getThemeValue('--gray-1000')

	const borderRadius = 3.5
	const pointRadius = 0
	const data = {
		labels: graphPayouts.map(({ timestamp }: { timestamp: number }) => {
			const dateObj = format(fromUnixTime(timestamp), 'do MMM', {
				locale: dateFormat,
			})
			return `${dateObj}`
		}),
		datasets: [
			{
				order: 1,
				label: labels.payout,
				data: graphPayouts.map(({ reward }: { reward: string }) => reward),
				borderColor: colorPayouts,
				backgroundColor: colorPayouts,
				pointRadius,
				borderRadius,
			},
			{
				order: 2,
				label: labels.poolClaim,
				data: graphPoolClaims.map(({ reward }: { reward: string }) => reward),
				borderColor: colorPoolClaims,
				backgroundColor: colorPoolClaims,
				pointRadius,
				borderRadius,
			},
			{
				order: 3,
				data: graphUnclaimedPayouts.map(
					({ reward }: { reward: string }) => reward,
				),
				label: labels.unclaimedPayouts,
				borderColor: colorPayouts,
				backgroundColor: getThemeValue('--gray-500'),
				pointRadius,
				borderRadius,
			},
		],
	}

	const annotations = useMemo(
		() =>
			buildPoolShareAnnotations({
				graphPayouts,
				poolShareRewards,
				getThemeValue,
				unit,
				units,
				poolShareLabel: labels.poolShare,
				activeAccount,
			}),
		[
			graphPayouts,
			poolShareRewards,
			getThemeValue,
			unit,
			units,
			labels.poolShare,
			activeAccount,
		],
	)

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		barPercentage: 0.5,
		maxBarThickness: 12,
		scales: {
			x: {
				stacked: true,
				grid: {
					display: false,
				},
				ticks: {
					font: {
						size: 10,
					},
					autoSkip: true,
				},
			},
			y: {
				stacked: true,
				ticks: {
					font: {
						size: 10,
					},
				},
				border: {
					display: false,
				},
				grid: {
					color: getThemeValue('--gray-500'),
				},
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: false,
			},
			annotation: {
				annotations,
			},
			tooltip: {
				displayColors: false,
				backgroundColor: getThemeValue('--gray-1000'),
				titleColor: getThemeValue('--gray-100'),
				bodyColor: getThemeValue('--gray-100'),
				bodyFont: {
					weight: 600,
				},
				callbacks: {
					title: () => [],
					label: ({ dataset, parsed }: TooltipItem<'bar'>) =>
						`${dataset.order === 3 ? `${labels.pending}: ` : ''}${new BigNumber(
							parsed?.y ?? 0,
						)
							.decimalPlaces(units)
							.toFormat()} ${unit}`,
				},
			},
		},
	}

	return (
		<div
			style={{
				height: height || 'auto',
			}}
		>
			{syncing && (
				<Spinner
					style={{ position: 'absolute', right: '3rem', top: '-4rem' }}
				/>
			)}
			<Bar options={options} data={data} />
		</div>
	)
}
