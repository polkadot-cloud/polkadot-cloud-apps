// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import type { FontSpec } from 'chart.js'
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
import { format, fromUnixTime } from 'date-fns'
import { Line } from 'react-chartjs-2'
import { Spinner } from 'ui-core/base'
import type { PayoutLineProps } from '../types'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
)

export const PayoutLine = ({
	entries,
	syncing,
	width,
	height,
	getThemeValue,
	unit,
	dateFormat,
	labels,
}: PayoutLineProps) => {
	// Format reward points as an array of strings, or an empty array if syncing
	const dataset = syncing
		? []
		: entries.map((entry) => new BigNumber(entry.reward).toString())

	// Use primary color for line
	const color = getThemeValue('--gray-1000')

	// Styling of axis titles
	const titleFontSpec: Partial<FontSpec> = {
		family: "'DM Sans', 'sans-serif'",
		weight: 'lighter',
		size: 11,
	}
	const titleStyle = {
		display: true,
		...titleFontSpec,
		color: getThemeValue('--gray-900'),
	}

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					font: {
						size: 10,
					},
					autoSkip: true,
				},
				title: {
					...titleStyle,
					text: labels.era,
				},
			},
			y: {
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
				title: {
					...titleStyle,
					text: `${unit} ${labels.reward}`,
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
					label: (context: { parsed: { y: number | null } }) =>
						`${new BigNumber(context.parsed.y ?? 0).toFormat()} ${unit}`,
				},
				intersect: false,
				interaction: {
					mode: 'nearest',
				},
			},
		},
	}

	const data = {
		labels: entries.map(({ start }: { start: number }) =>
			format(fromUnixTime(start), 'dd MMM', {
				locale: dateFormat,
			}),
		),
		datasets: [
			{
				label: labels.payouts,
				data: dataset,
				borderColor: color,
				backgroundColor: color,
				pointRadius: 0,
				borderWidth: 3,
			},
		],
	}

	return (
		<div
			style={{
				width: width || '100%',
				height: height || 'auto',
			}}
		>
			{syncing && (
				<Spinner
					style={{ position: 'absolute', right: '3rem', top: '-4rem' }}
				/>
			)}
			<Line options={options} data={data} />
		</div>
	)
}
