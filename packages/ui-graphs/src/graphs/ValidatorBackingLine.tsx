// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
	CategoryScale,
	LinearScale,
	LineElement,
	PointElement,
	Legend,
	Tooltip,
)

interface Props {
	entries: { era: number; backing: number | null; nominators: number | null }[]
	labels: { era: string; backing: string; nominators: string }
	colors: { backing: string; nominators: string; text: string }
	unit: string
	locale?: string
}

const axisTitle = (text: string, color: string) => ({
	display: true,
	text,
	color,
})

export const ValidatorBackingLine = ({
	entries,
	labels,
	colors,
	unit,
	locale,
}: Props) => {
	const backingLabel = `${labels.backing} (${unit})`
	const backingTicks = new Intl.NumberFormat(locale, {
		notation: 'compact',
		maximumSignificantDigits: 15,
	})
	const dataset = (key: 'backing' | 'nominators', label: string) => ({
		label,
		data: entries.map((entry) => entry[key]),
		yAxisID: key,
		borderColor: colors[key],
		backgroundColor: colors[key],
	})
	return (
		<Line
			role="img"
			aria-label={`${backingLabel} / ${labels.nominators}`}
			data={{
				labels: entries.map(({ era }) => era),
				datasets: [
					{
						...dataset('backing', backingLabel),
						// Draw the solid line first so the dashes stay visible at crossings.
						order: 1,
					},
					{
						...dataset('nominators', labels.nominators),
						borderDash: [9, 7],
						pointRadius: ({ dataIndex }) =>
							entries[dataIndex - 1]?.nominators == null &&
							entries[dataIndex + 1]?.nominators == null
								? 2
								: 0,
					},
				],
			}}
			options={{
				responsive: true,
				maintainAspectRatio: false,
				spanGaps: false,
				interaction: { mode: 'index', intersect: false },
				elements: { point: { radius: 1 }, line: { borderWidth: 2 } },
				plugins: {
					legend: {
						reverse: true,
						labels: { color: colors.text, boxWidth: 30, boxHeight: 0 },
					},
				},
				scales: {
					x: {
						title: axisTitle(labels.era, colors.text),
						ticks: { maxTicksLimit: 8, color: colors.text },
						grid: { display: false },
					},
					backing: {
						type: 'linear',
						position: 'left',
						title: axisTitle(unit, colors.backing),
						ticks: {
							color: colors.backing,
							callback: (value) => backingTicks.format(Number(value)),
						},
					},
					nominators: {
						type: 'linear',
						position: 'right',
						title: axisTitle(labels.nominators, colors.nominators),
						ticks: { precision: 0, color: colors.nominators },
						grid: { drawOnChartArea: false },
					},
				},
			}}
		/>
	)
}
