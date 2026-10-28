// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import type { Chart as ChartType } from 'chart.js'
import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
} from 'chart.js'
import { color as chartColor } from 'chart.js/helpers'
import type { AnnotationOptions } from 'chartjs-plugin-annotation'
import annotationPlugin from 'chartjs-plugin-annotation'
import { format, fromUnixTime, getUnixTime } from 'date-fns'
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { planckToUnitBn, startOfUTCDay, subUTCDays } from 'utils'
import type { PoolSharesTrendLineProps } from '../types'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Legend,
	annotationPlugin,
)

const colorWithAlpha = (value: string, alpha: number, fallback = '#000000') => {
	const parsedColor = chartColor(value)
	return (parsedColor.valid ? parsedColor : chartColor(fallback))
		.alpha(alpha)
		.rgbString()
}

const CLAIM_LINE_VALUE = 1

export const PoolSharesTrendLine = ({
	days,
	entries,
	claimedEntries,
	syncing,
	height,
	getThemeValue,
	unit,
	units,
	dateFormat,
	plotAreaPadding,
	labels,
}: PoolSharesTrendLineProps) => {
	const currentDate = useMemo(() => startOfUTCDay(new Date()), [])
	const { series, annotations } = useMemo(() => {
		const startTimestamp = getUnixTime(subUTCDays(currentDate, days - 1))
		const shareDays = new Set<number>()
		const claimsByDay = new Map<number, BigNumber>()
		const getDayTimestamp = (timestamp: number) =>
			getUnixTime(startOfUTCDay(fromUnixTime(timestamp)))

		entries.forEach(({ timestamp }) => {
			const dayTimestamp = getDayTimestamp(timestamp)
			if (dayTimestamp >= startTimestamp) {
				shareDays.add(dayTimestamp)
			}
		})
		claimedEntries.forEach(({ reward, timestamp }) => {
			const dayTimestamp = getDayTimestamp(timestamp)
			if (dayTimestamp < startTimestamp) {
				return
			}
			const previous = claimsByDay.get(dayTimestamp) ?? new BigNumber(0)
			claimsByDay.set(dayTimestamp, previous.plus(reward))
		})

		const series = [...new Set([...shareDays, ...claimsByDay.keys()])]
			.sort((timestampA, timestampB) => timestampA - timestampB)
			.map((timestamp) => ({
				timestamp,
				claimedReward: claimsByDay.has(timestamp)
					? planckToUnitBn(
							claimsByDay.get(timestamp) ?? new BigNumber(0),
							units,
						).toString()
					: null,
			}))
		const annotations: Record<string, AnnotationOptions> = {}

		if (syncing) {
			return { series, annotations }
		}

		const tipBgColor = getThemeValue('--gray-1000')
		const tipTextColor = getThemeValue('--gray-100')
		series.forEach(({ claimedReward }, index) => {
			if (claimedReward === null) {
				return
			}

			const tipId = `pool-claim-tip-${index}`
			const value = new BigNumber(claimedReward).decimalPlaces(units).toFormat()
			const tipContent = `${value} ${unit}`
			const claimBadgeXOffset = 0
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
				tip.backgroundColor = colorWithAlpha(tipBgColor, a)
				tip.color = colorWithAlpha(tipTextColor, a, '#ffffff')
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
				adjustScaleRange: false,
				xValue: index,
				yValue: CLAIM_LINE_VALUE,
				yAdjust: 27,
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
				adjustScaleRange: false,
				xValue: index,
				yValue: CLAIM_LINE_VALUE,
				yAdjust: 14,
				xAdjust: getClaimBadgeXAdjust,
				content: '\u25B2',
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
				adjustScaleRange: false,
				display: false,
				xValue: index,
				yValue: CLAIM_LINE_VALUE,
				yAdjust: -20,
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
		unit,
	])

	const color = getThemeValue('--gray-1000') || '#000000'
	const lineColor = colorWithAlpha(color, 0.55)
	const data = {
		labels: series.map(({ timestamp }) =>
			format(fromUnixTime(timestamp), 'do MMM', {
				locale: dateFormat,
			}),
		),
		datasets: [
			{
				data: syncing ? [] : series.map(() => CLAIM_LINE_VALUE),
				borderColor: lineColor,
				backgroundColor: 'transparent',
				pointBackgroundColor: lineColor,
				pointBorderColor: getThemeValue('--gray-200') || '#ffffff',
				pointBorderWidth: 3,
				pointRadius: ({ dataIndex }: { dataIndex: number }) =>
					series[dataIndex]?.claimedReward ? 6 : 0,
				pointHoverRadius: ({ dataIndex }: { dataIndex: number }) =>
					series[dataIndex]?.claimedReward ? 7 : 0,
				pointHitRadius: ({ dataIndex }: { dataIndex: number }) =>
					series[dataIndex]?.claimedReward ? 7 : 0,
				borderWidth: 2.5,
				tension: 0,
				fill: false,
			},
		],
	}
	const options = {
		responsive: true,
		maintainAspectRatio: false,
		layout: {
			autoPadding: false,
			padding: {
				left: plotAreaPadding?.left ?? 0,
				right: plotAreaPadding?.right ?? 0,
			},
		},
		scales: {
			x: {
				display: false,
				offset: true,
			},
			y: {
				display: true,
				min: 0,
				max: 2,
				ticks: {
					display: false,
					maxTicksLimit: 4,
				},
				border: {
					display: false,
				},
				grid: {
					color: getThemeValue('--gray-500'),
					drawTicks: false,
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
				enabled: false,
			},
		},
	}

	return (
		<div style={{ height: height || 'auto', position: 'relative' }}>
			<Line options={options} data={data} />
		</div>
	)
}
