// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import type { TooltipItem } from 'chart.js'
import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js'
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import type { AveragePayoutLineProps } from '../types'
import {
	calculatePayoutAverages,
	combineRewards,
	formatRewardsForGraphs,
} from '../util/index'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
)

export const AveragePayoutLine = ({
	days,
	average,
	height,
	background,
	data: { payouts, poolClaims },
	getThemeValue,
	unit,
	units,
	labels,
}: AveragePayoutLineProps) => {
	// Memoize current date for the component's lifetime
	const fromDate = useMemo(() => new Date(), [])

	const { allPayouts, allPoolClaims } = formatRewardsForGraphs(
		fromDate,
		days,
		units,
		payouts,
		poolClaims,
		[], // Note: we are not using `unclaimedPayouts` here
	)
	const { p: graphPayouts, a: graphPrePayouts } = allPayouts
	const { p: graphPoolClaims, a: graphPrePoolClaims } = allPoolClaims

	// Combine payouts and pool claims into one dataset and calculate averages
	const combined = combineRewards(
		graphPayouts.map(({ reward, timestamp }) => ({
			reward,
			timestamp,
		})),
		graphPoolClaims,
	)
	const preCombined = combineRewards(graphPrePayouts, graphPrePoolClaims)

	const combinedPayouts = calculatePayoutAverages(
		preCombined.concat(combined),
		fromDate,
		days,
		10,
	)

	// Determine color for payouts
	const color = getThemeValue('--gray-1000')

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					display: false,
					maxTicksLimit: 30,
					autoSkip: true,
				},
			},
			y: {
				ticks: {
					display: false,
					beginAtZero: false,
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
					label: ({ parsed }: TooltipItem<'line'>) =>
						` ${new BigNumber(parsed?.y ?? 0)
							.decimalPlaces(units)
							.toFormat()} ${unit}`,
				},
				intersect: false,
				interaction: {
					mode: 'nearest',
				},
			},
		},
	}

	const data = {
		labels: combinedPayouts.map(() => ''),
		datasets: [
			{
				label: labels.payout,
				data: combinedPayouts.map(({ reward }) => Number(reward)),
				borderColor: color,
				pointStyle: undefined,
				pointRadius: 0,
				borderWidth: 2.3,
				tension: 0.25,
				fill: false,
			},
		],
	}

	return (
		<>
			<h5 className="secondary" style={{ paddingLeft: '1.5rem' }}>
				{average > 1 ? `${average} ${labels.dayAverage}` : null}
			</h5>
			<div
				style={{
					height: height || 'auto',
					background: background || 'none',
					marginTop: '0.6rem',
					padding: '0 0 0.5rem 1.5rem',
				}}
			>
				<Line options={options} data={data} />
			</div>
		</>
	)
}
