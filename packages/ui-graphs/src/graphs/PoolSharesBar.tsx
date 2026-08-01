// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import type { Chart as ChartType } from 'chart.js'
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from 'chart.js'
import { format, fromUnixTime, getUnixTime } from 'date-fns'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Spinner } from 'ui-core/base'
import { planckToUnitBn, startOfUTCDay, subUTCDays } from 'utils'
import type { PoolSharesBarProps } from '../types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const PoolSharesBar = ({
	days,
	entries,
	claimedEntries,
	barColor,
	yAxisMax,
	syncing,
	height,
	hideYAxisLabels = false,
	getThemeValue,
	unit,
	units,
	dateFormat,
	onPlotAreaChange,
	labels,
}: PoolSharesBarProps) => {
	const currentDate = useMemo(() => startOfUTCDay(new Date()), [])
	const series = useMemo(() => {
		const startTimestamp = getUnixTime(subUTCDays(currentDate, days - 1))
		const sharesByDay = new Map<number, BigNumber>()
		const claimDays = new Set<number>()

		entries.forEach(({ reward, timestamp }) => {
			const dayTimestamp = getUnixTime(startOfUTCDay(fromUnixTime(timestamp)))
			if (dayTimestamp < startTimestamp) {
				return
			}
			const previous = sharesByDay.get(dayTimestamp) ?? new BigNumber(0)
			sharesByDay.set(dayTimestamp, previous.plus(reward))
		})
		claimedEntries.forEach(({ timestamp }) => {
			const dayTimestamp = getUnixTime(startOfUTCDay(fromUnixTime(timestamp)))
			if (dayTimestamp >= startTimestamp) {
				claimDays.add(dayTimestamp)
			}
		})

		return [...new Set([...sharesByDay.keys(), ...claimDays])]
			.sort((timestampA, timestampB) => timestampA - timestampB)
			.map((timestamp) => ({
				timestamp,
				shareReward: sharesByDay.has(timestamp)
					? planckToUnitBn(
							sharesByDay.get(timestamp) ?? new BigNumber(0),
							units,
						).toString()
					: null,
			}))
	}, [currentDate, days, entries, claimedEntries, units])
	const plotAreaPlugin = useMemo(
		() => ({
			id: 'pool-shares-plot-area',
			afterLayout: (chart: ChartType) => {
				onPlotAreaChange?.({
					left: Math.round(chart.chartArea.left),
					right: Math.round(chart.width - chart.chartArea.right),
				})
			},
		}),
		[onPlotAreaChange],
	)

	const color = barColor || getThemeValue('--gray-1000') || '#000000'
	const chartLabels = series.map(({ timestamp }) =>
		format(fromUnixTime(timestamp), 'do MMM', {
			locale: dateFormat,
		}),
	)
	const chartValues = syncing
		? []
		: series.map(({ shareReward }) => shareReward)
	const barData = {
		labels: chartLabels,
		datasets: [
			{
				data: chartValues,
				backgroundColor: color,
				borderColor: color,
				borderRadius: 5,
				borderSkipped: false as const,
				barPercentage: 0.65,
				categoryPercentage: 0.8,
				maxBarThickness: 12,
			},
		],
	}
	const tooltip = {
		displayColors: false,
		backgroundColor: getThemeValue('--gray-1000'),
		titleColor: getThemeValue('--gray-100'),
		bodyColor: getThemeValue('--gray-100'),
		bodyFont: {
			weight: 600,
		},
		callbacks: {
			title: () => [],
			label: ({ parsed }: { parsed: { y: number | null } }) =>
				`${new BigNumber(parsed?.y ?? 0)
					.decimalPlaces(units)
					.toFormat()} ${unit}`,
		},
	}

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				offset: true,
				grid: {
					display: false,
				},
				ticks: {
					font: {
						size: 10,
					},
					autoSkip: true,
					maxRotation: 0,
				},
				border: {
					display: false,
				},
			},
			y: {
				beginAtZero: true,
				max: yAxisMax,
				title: {
					display: !hideYAxisLabels,
					text: labels.amount,
					color: getThemeValue('--gray-800'),
					font: {
						size: 10,
						weight: 500,
					},
					padding: {
						top: 4,
						bottom: 8,
					},
				},
				ticks: {
					display: !hideYAxisLabels,
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
			tooltip,
		},
	}

	return (
		<div
			style={{
				height: height || 'auto',
				position: 'relative',
			}}
		>
			{syncing && (
				<Spinner
					style={{ position: 'absolute', right: '3rem', top: '-4rem' }}
				/>
			)}
			<Bar options={options} data={barData} plugins={[plotAreaPlugin]} />
		</div>
	)
}
