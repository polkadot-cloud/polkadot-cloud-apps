// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChartOptions, FontSpec } from 'chart.js'
import {
	CategoryScale,
	Chart as ChartJS,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { HALVING_SCHEDULE } from 'consts/halving'
import { Line } from 'react-chartjs-2'
import type { HalvingLineProps } from '../types'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
	annotationPlugin,
)

export const HalvingLine = ({
	getThemeValue,
	label,
	tooltipLabel,
	millionUnit,
}: HalvingLineProps) => {
	const now = new Date()
	const currentYear = now.getFullYear()
	const yearStart = new Date(currentYear, 0, 1)
	const yearEnd = new Date(currentYear + 1, 0, 1)
	const yearProgress =
		(now.getTime() - yearStart.getTime()) /
		(yearEnd.getTime() - yearStart.getTime())
	const schedule = HALVING_SCHEDULE.filter((item) => item.year <= 2050.2)
	const currentDataIndex = schedule.findIndex(
		(item) => item.year === currentYear,
	)
	const currentYearValue =
		schedule[currentDataIndex]?.year !== undefined
			? schedule[currentDataIndex]?.year + yearProgress
			: undefined

	// Use primary color for line
	const color = getThemeValue('--gray-1000')
	const backgroundColor = getThemeValue('--gray-400')

	// Styling of axis titles
	const titleFontSpec: Partial<FontSpec> = {
		family: "'DM Sans', 'sans-serif'",
		weight: 'lighter',
		size: 11,
	}
	const titleStyle = {
		color: getThemeValue('--text-tertiary'),
		display: true,
		padding: 6,
		font: titleFontSpec,
	}

	const options: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			mode: 'nearest',
			intersect: false,
		},
		scales: {
			x: {
				type: 'linear',
				grid: {
					display: false,
				},
				min: schedule[0]?.year,
				max: schedule[schedule.length - 1]?.year,
				ticks: {
					color: getThemeValue('--text-tertiary'),
					font: {
						size: 10,
					},
					autoSkip: false,
					maxTicksLimit: 20,
					stepSize: 2,
					precision: 0,
					callback: (value: string | number) =>
						Math.round(Number(value)).toString(),
				},
				title: {
					display: false,
				},
			},
			y: {
				beginAtZero: true,
				ticks: {
					color: getThemeValue('--text-tertiary'),
					font: {
						size: 10,
					},
					autoSkip: true,
					maxTicksLimit: 6,
					callback: (value: number | string) =>
						`${(Number(value) / 1_000_000).toFixed(1)}${millionUnit}`,
				},
				border: {
					display: false,
				},
				grid: {
					color: getThemeValue('--gray-500'),
				},
				title: {
					...titleStyle,
					text: label,
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
				mode: 'nearest',
				displayColors: false,
				backgroundColor: getThemeValue('--gray-1000'),
				titleColor: getThemeValue('--gray-100'),
				bodyColor: getThemeValue('--gray-100'),
				bodyFont: {
					weight: 600,
				},
				callbacks: {
					title: () => [],
					label: (context: { dataIndex: number }) => {
						const value = schedule[context.dataIndex]?.issuance ?? 0
						return tooltipLabel(value)
					},
				},
			},
			annotation: {
				annotations: {
					currentYearLine: {
						type: 'line',
						display: currentYearValue !== undefined,
						xMin: currentYearValue ?? 0,
						xMax: currentYearValue ?? 0,
						borderColor: getThemeValue('--gray-1000'),
						borderWidth: 2,
						borderDash: [5, 5],
						label: {
							display: false,
						},
					},
				},
			},
		},
	}

	const data = {
		datasets: [
			{
				label,
				data: schedule.map((item) => ({ x: item.year, y: item.issuance })),
				borderColor: color,
				backgroundColor,
				pointRadius: 0,
				pointHoverRadius: 4,
				pointHitRadius: 4,
				pointBackgroundColor: 'transparent',
				pointHoverBackgroundColor: color,
				pointBorderColor: 'transparent',
				pointHoverBorderColor: color,
				pointBorderWidth: 2,
				borderWidth: 2,
				fill: true,
				stepped: 'before' as const,
			},
		],
	}

	return (
		<div
			style={{
				height: '100%',
				width: '100%',
			}}
		>
			<Line options={options} data={data} />
		</div>
	)
}
