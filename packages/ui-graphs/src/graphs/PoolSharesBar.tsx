// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import type { Chart as ChartType } from 'chart.js'
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
import { color as chartColor } from 'chart.js/helpers'
import type { AnnotationOptions } from 'chartjs-plugin-annotation'
import annotationPlugin from 'chartjs-plugin-annotation'
import { format, fromUnixTime, getUnixTime } from 'date-fns'
import { useMemo } from 'react'
import { Chart } from 'react-chartjs-2'
import { Spinner } from 'ui-core/base'
import { planckToUnitBn, startOfUTCDay, subUTCDays } from 'utils'
import type { PoolSharesBarProps } from '../types'

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

export const PoolSharesBar = ({
	days,
	entries,
	claimedEntries,
	syncing,
	height,
	hideYAxisLabels = false,
	getThemeValue,
	unit,
	units,
	dateFormat,
	labels,
}: PoolSharesBarProps) => {
	const currentDate = useMemo(() => startOfUTCDay(new Date()), [])
	const { series, annotations } = useMemo(() => {
		const startTimestamp = getUnixTime(subUTCDays(currentDate, days - 1))
		const sharesByDay = new Map<number, BigNumber>()
		const claimsByDay = new Map<number, BigNumber>()
		const addToDay = (
			totals: Map<number, BigNumber>,
			timestamp: number,
			reward: string,
		) => {
			const dayTimestamp = getUnixTime(startOfUTCDay(fromUnixTime(timestamp)))
			if (dayTimestamp < startTimestamp) {
				return
			}
			const previous = totals.get(dayTimestamp) ?? new BigNumber(0)
			totals.set(dayTimestamp, previous.plus(reward))
		}

		entries.forEach(({ reward, timestamp }) => {
			addToDay(sharesByDay, timestamp, reward)
		})
		claimedEntries.forEach(({ reward, timestamp }) => {
			addToDay(claimsByDay, timestamp, reward)
		})

		const series = [...new Set([...sharesByDay.keys(), ...claimsByDay.keys()])]
			.sort((a, b) => a - b)
			.map((timestamp) => ({
				timestamp,
				shareReward: sharesByDay.has(timestamp)
					? planckToUnitBn(
							sharesByDay.get(timestamp) ?? new BigNumber(0),
							units,
						).toString()
					: null,
				claimedReward: claimsByDay.has(timestamp)
					? planckToUnitBn(
							claimsByDay.get(timestamp) ?? new BigNumber(0),
							units,
						).toString()
					: null,
			}))

		const annotations: Record<string, AnnotationOptions> = {}
		const tipBgColor = getThemeValue('--gray-1000')
		const tipTextColor = getThemeValue('--gray-100')

		if (!syncing) {
			series.forEach(({ shareReward }, index) => {
				if (shareReward === null) {
					return
				}
				annotations[`pool-share-guide-${index}`] = {
					type: 'line',
					drawTime: 'beforeDatasetsDraw',
					xMin: index,
					xMax: index,
					yMin: 0,
					yMax: new BigNumber(shareReward).toNumber(),
					borderColor: chartColor(getThemeValue('--gray-1000'))
						.alpha(0.28)
						.rgbString(),
					borderDash: [2, 4],
					borderWidth: 1.4,
				}
			})
		}

		if (syncing) {
			return { series, annotations }
		}

		series.forEach(({ claimedReward }, index) => {
			if (claimedReward === null) {
				return
			}

			const tipId = `pool-claim-tip-${index}`
			const value = new BigNumber(claimedReward).decimalPlaces(units).toFormat()
			const tipContent = `${value} ${unit}`
			const claimBadgeXOffset = -28
			const claimBadgeWidth = labels.claim.length * 6 + 18
			const getXAdjust = (
				ctx: { chart: ChartType },
				estimatedWidth: number,
				baseOffset = 0,
			) => {
				const area = ctx.chart.chartArea
				const scale = ctx.chart.scales.x
				if (!area || !scale) {
					return baseOffset
				}
				const xPx = scale.getPixelForValue(index) + baseOffset
				const half = estimatedWidth / 2
				const margin = 4
				if (xPx - half < area.left + margin) {
					return baseOffset + area.left + margin + half - xPx
				}
				if (xPx + half > area.right - margin) {
					return baseOffset + area.right - margin - half - xPx
				}
				return baseOffset
			}
			const getClaimBadgeXAdjust = (ctx: { chart: ChartType }) =>
				getXAdjust(ctx, claimBadgeWidth, claimBadgeXOffset)
			let alpha = 0
			let rafId: number | null = null

			const applyAlpha = (tip: AnnotationOptions<'label'>, a: number) => {
				tip.display = a > 0
				tip.backgroundColor = chartColor(tipBgColor).alpha(a).rgbString()
				tip.color = chartColor(tipTextColor).alpha(a).rgbString()
			}

			const toggleTip = (chart: ChartType, show: boolean) => {
				const chartAnnotations = chart.options.plugins?.annotation
					?.annotations as Record<string, AnnotationOptions> | undefined
				const tip = chartAnnotations?.[tipId] as
					| AnnotationOptions<'label'>
					| undefined
				if (!tip) {
					return
				}

				const target = show ? 1 : 0
				const from = alpha
				const duration = 150
				const start = performance.now()
				if (rafId !== null) {
					cancelAnimationFrame(rafId)
				}
				const step = (now: number) => {
					const t = Math.min(1, (now - start) / duration)
					alpha = from + (target - from) * t
					applyAlpha(tip, alpha)
					chart.update('none')
					if (t < 1) {
						rafId = requestAnimationFrame(step)
					} else {
						rafId = null
					}
				}
				rafId = requestAnimationFrame(step)
			}

			annotations[`pool-claim-flag-${index}`] = {
				type: 'label',
				xValue: index,
				yValue: 0,
				yAdjust: -16,
				xAdjust: getClaimBadgeXAdjust,
				content: labels.claim,
				backgroundColor: getThemeValue('--gray-1000'),
				color: getThemeValue('--gray-100'),
				font: { size: 10, weight: 'bold' },
				padding: { top: 4, right: 7, bottom: 4, left: 7 },
				borderWidth: 0,
				borderRadius: 5,
				enter: ({ chart }) => {
					toggleTip(chart, true)
					return true
				},
				leave: ({ chart }) => {
					toggleTip(chart, false)
					return true
				},
			}
			annotations[`pool-claim-arrow-${index}`] = {
				type: 'label',
				xValue: index,
				yValue: 0,
				yAdjust: -15.5,
				xAdjust: (ctx) => getClaimBadgeXAdjust(ctx) + claimBadgeWidth / 2 - 1,
				content: '\u25B6',
				backgroundColor: 'transparent',
				color: getThemeValue('--gray-1000'),
				font: { size: 9, weight: 'bold' },
				padding: 0,
				borderWidth: 0,
				enter: ({ chart }) => {
					toggleTip(chart, true)
					return true
				},
				leave: ({ chart }) => {
					toggleTip(chart, false)
					return true
				},
			}
			annotations[tipId] = {
				type: 'label',
				display: false,
				xValue: index,
				yValue: 0,
				yAdjust: -44,
				xAdjust: (ctx) =>
					getXAdjust(ctx, tipContent.length * 6 + 14, claimBadgeXOffset),
				backgroundColor: 'transparent',
				color: 'transparent',
				font: { size: 11, weight: 'bold' },
				padding: { top: 6, right: 6, bottom: 6, left: 6 },
				borderRadius: 4,
				content: tipContent,
			}
		})

		return { series, annotations }
	}, [
		currentDate,
		days,
		entries,
		claimedEntries,
		syncing,
		units,
		getThemeValue,
		labels.claim,
		labels.claimed,
		unit,
	])

	const color = getThemeValue('--gray-1000')
	const lineAreaColor = chartColor(color).alpha(0.14).rgbString()

	const data = {
		labels: series.map(({ timestamp }) =>
			format(fromUnixTime(timestamp), 'do MMM', {
				locale: dateFormat,
			}),
		),
		datasets: [
			{
				type: 'line' as const,
				label: labels.poolShares,
				data: syncing ? [] : series.map(({ shareReward }) => shareReward),
				borderColor: color,
				backgroundColor: (context: { chart: ChartType }) => {
					const { chart } = context
					const { chartArea, ctx } = chart
					if (!chartArea) {
						return lineAreaColor
					}
					const gradient = ctx.createLinearGradient(
						0,
						chartArea.top,
						0,
						chartArea.bottom,
					)
					gradient.addColorStop(0, chartColor(color).alpha(0.16).rgbString())
					gradient.addColorStop(1, chartColor(color).alpha(0).rgbString())
					return gradient
				},
				pointBackgroundColor: color,
				pointBorderColor: getThemeValue('--bg-primary'),
				pointBorderWidth: 2,
				pointRadius: 4,
				pointHoverRadius: 5,
				borderWidth: 2,
				tension: 0.35,
				spanGaps: true,
				fill: true,
				order: 1,
			},
		],
	}

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				offset: false,
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
				beginAtZero: true,
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
			annotation: {
				clip: false,
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
					label: ({ parsed }: { parsed: { y: number | null } }) =>
						`${new BigNumber(parsed?.y ?? 0)
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
				position: 'relative',
			}}
		>
			{syncing && (
				<Spinner
					style={{ position: 'absolute', right: '3rem', top: '-4rem' }}
				/>
			)}
			<Chart type="line" options={options} data={data} />
		</div>
	)
}
