// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ellipsisFn } from '@w3ux/utils'
import type { TooltipItem } from 'chart.js'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import chroma from 'chroma-js'
import { Doughnut } from 'react-chartjs-2'
import type { GeoDonutProps } from '../types'

ChartJS.register(ArcElement, Tooltip, Legend)

export const GeoDonut = ({
	title,
	series = { labels: [], data: [] },
	legendHeight = 25,
	maxLabelLen = 3,
	getThemeValue,
}: GeoDonutProps) => {
	const { labels } = series
	let { data } = series
	const isZero = data.length === 0
	const backgroundColor = isZero
		? getThemeValue('--bg-body')
		: getThemeValue('--gray-1000')

	const total = data.reduce((acc: number, value: number) => acc + value, 0)

	data = data.map((value: number) => (value / total) * 100)

	const options = {
		borderColor: getThemeValue('--bg-body'),
		hoverBorderColor: getThemeValue('--bg-body'),
		backgroundColor,
		hoverBackgroundColor: [backgroundColor, getThemeValue('--bg-body')],
		responsive: true,
		maintainAspectRatio: false,
		spacing: 0,
		cutout: '75%',
		plugins: {
			legend: {
				display: true,
				position: 'bottom' as const,
				maxHeight: legendHeight,
				labels: {
					boxWidth: 10,
					generateLabels: (chart: ChartJS) => {
						const ls =
							ChartJS.overrides.doughnut.plugins.legend.labels.generateLabels(
								chart,
							)
						return ls.map((l) => {
							l.text =
								maxLabelLen && l.text.length > maxLabelLen
									? ellipsisFn(l.text, maxLabelLen, 'end')
									: l.text
							return l
						})
					},
				},
			},
			tooltip: {
				enabled: true,
				callbacks: {
					label: (context: TooltipItem<'doughnut'>) =>
						` ${title}: ${Number(context.raw).toFixed(1)} %`,
				},
			},
		},
	}

	const chartData = {
		labels,
		datasets: [
			{
				label: title,
				data,
				// We make a gradient of N+2 colors from active to inactive, and we discard both ends N is
				// the number of datapoints to plot.
				backgroundColor: chroma
					.scale([backgroundColor, getThemeValue('--bg-body')])
					.colors(data.length + 1),
				borderWidth: 0.5,
			},
		],
	}

	return (
		<div style={{ width: '100%', height: '100%' }}>
			<Doughnut options={options} data={chartData} />
		</div>
	)
}
