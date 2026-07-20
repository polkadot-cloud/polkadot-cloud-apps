// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import type { Chart } from 'chart.js'
import { color } from 'chart.js/helpers'
import type { AnnotationOptions } from 'chartjs-plugin-annotation'
import { fromUnixTime, getUnixTime } from 'date-fns'
import { planckToUnitBn, startOfUTCDay } from 'utils'

type BuildPoolShareAnnotationsArgs = {
	graphPayouts: { timestamp: number }[]
	poolShareRewards?: { timestamp: number; reward: string }[]
	getThemeValue: (key: string) => string
	unit: string
	units: number
	poolShareLabel: string
	activeAccount?: string
}

// Tracks which accounts have already run their init animation in this
// app session, so subsequent re-renders for the same owner don't replay it.
const animatedAccounts = new Set<string>()

export const buildPoolShareAnnotations = ({
	graphPayouts,
	poolShareRewards,
	getThemeValue,
	unit,
	units,
	poolShareLabel,
	activeAccount,
}: BuildPoolShareAnnotationsArgs): Record<string, AnnotationOptions> => {
	if (!poolShareRewards?.length) {
		return {}
	}

	const indexByDay = new Map<number, number>()
	graphPayouts.forEach(({ timestamp }, index) => {
		indexByDay.set(timestamp, index)
	})

	const totalsByIndex = new Map<number, BigNumber>()
	for (const { timestamp, reward } of poolShareRewards) {
		const dayTs = getUnixTime(startOfUTCDay(fromUnixTime(timestamp)))
		const index = indexByDay.get(dayTs)
		if (index === undefined) {
			continue
		}
		const previous = totalsByIndex.get(index) ?? new BigNumber(0)
		totalsByIndex.set(index, previous.plus(reward))
	}

	const barColor = color(getThemeValue('--gray-1000')).alpha(0.75).rgbString()
	const tipBgColor = getThemeValue('--gray-1000')
	const tipTextColor = getThemeValue('--gray-100')
	const annotations: Record<string, AnnotationOptions> = {}
	// Half-width of the vertical bar in category units (1 = full slot width).
	const barHalfWidth = 0.09
	// Only run the grow-in animation the first time we build annotations for
	// this owner; subsequent rebuilds (theme changes, hover updates, etc.)
	// should render the bars in place.
	const shouldAnimateInit =
		activeAccount !== undefined && !animatedAccounts.has(activeAccount)
	if (activeAccount !== undefined) {
		animatedAccounts.add(activeAccount)
	}

	for (const [index, planckTotal] of totalsByIndex) {
		const unitValue = planckToUnitBn(planckTotal, units)
		if (unitValue.lte(0)) {
			continue
		}
		const value =
			unitValue.isFinite() && unitValue.lte(Number.MAX_VALUE)
				? unitValue.toNumber()
				: Number.MAX_VALUE

		const tipId = `poolShare-tip-${index}`
		const tipContent = `${poolShareLabel}: ${unitValue.decimalPlaces(units).toFormat()} ${unit}`

		// Per-tip fade state and animation handle (closed over by toggleTip).
		let alpha = 0
		let rafId: number | null = null

		const applyAlpha = (tip: AnnotationOptions<'label'>, a: number) => {
			tip.display = a > 0
			tip.backgroundColor = color(tipBgColor).alpha(a).rgbString()
			tip.color = color(tipTextColor).alpha(a).rgbString()
		}

		const toggleTip = (chart: Chart, show: boolean) => {
			const chartAnnotations = chart.options.plugins?.annotation?.annotations as
				| Record<string, AnnotationOptions>
				| undefined
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

		const boxAnnotation: AnnotationOptions<'box'> = {
			type: 'box',
			xMin: index - barHalfWidth,
			xMax: index + barHalfWidth,
			yMin: 0,
			yMax: value,
			backgroundColor: barColor,
			borderColor: barColor,
			borderWidth: 0,
			borderRadius: {
				topLeft: 4,
				topRight: 4,
				bottomLeft: 0,
				bottomRight: 0,
			},
			// Grow the bar from its baseline (bottom edge) on initial render,
			// matching the chart's bar animation. Only applied on the first
			// build for this animation key so re-renders don't replay it.
			...(shouldAnimateInit
				? {
						init: ({ properties }) => ({
							x: properties.x,
							y: properties.y2,
							x2: properties.x2,
							y2: properties.y2,
							width: properties.width,
							height: 0,
						}),
					}
				: {}),
			enter: ({ chart }) => {
				toggleTip(chart, true)
				return true
			},
			leave: ({ chart }) => {
				toggleTip(chart, false)
				return true
			},
		}

		const tipAnnotation: AnnotationOptions<'label'> = {
			type: 'label',
			display: false,
			xValue: index,
			yValue: value,
			yAdjust: -14,
			// Nudge horizontally if the tip would overflow the left/right edge
			// of the chart area.
			xAdjust: (ctx) => {
				const area = ctx.chart.chartArea
				if (!area) {
					return 0
				}
				const tipWidthEstimate = tipContent.length * 6 + 12
				const half = tipWidthEstimate / 2
				const margin = 4
				const xPx = ctx.chart.scales.x?.getPixelForValue(index) ?? 0
				if (xPx - half < area.left + margin) {
					return area.left + margin + half - xPx
				}
				if (xPx + half > area.right - margin) {
					return area.right - margin - half - xPx
				}
				return 0
			},
			backgroundColor: 'transparent',
			color: 'transparent',
			font: { size: 11, weight: 'bold' },
			padding: { top: 6, right: 6, bottom: 6, left: 6 },
			borderRadius: 4,
			content: tipContent,
		}

		annotations[`poolShare-${index}`] = boxAnnotation
		annotations[tipId] = tipAnnotation
	}

	return annotations
}
