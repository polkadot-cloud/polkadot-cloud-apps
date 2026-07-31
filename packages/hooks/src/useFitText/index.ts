// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useLayoutEffect, useRef } from 'react'

interface FitTextOptions {
	enabled?: boolean
	minFontSizePx?: number
}

// Shrinks single-line text to fit its element, down to the supplied minimum.
export const useFitText = <T extends HTMLElement>(
	text: string,
	{ enabled = true, minFontSizePx = 11 }: FitTextOptions = {},
) => {
	const ref = useRef<T>(null)

	useLayoutEffect(() => {
		const element = ref.current
		if (!enabled || !element) {
			return
		}

		const fit = () => {
			element.style.fontSize = ''
			const { clientWidth, scrollWidth } = element

			if (clientWidth && scrollWidth > clientWidth) {
				const fontSize = Number.parseFloat(getComputedStyle(element).fontSize)
				const fittedSize = Math.floor((fontSize * clientWidth) / scrollWidth)
				element.style.fontSize = `${Math.max(minFontSizePx, fittedSize)}px`
			}
		}

		fit()

		const target = element.parentElement
		if (!target) {
			return
		}

		const resizeObserver =
			typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit)
		const mutationObserver =
			typeof MutationObserver === 'undefined' ? null : new MutationObserver(fit)

		resizeObserver?.observe(target)
		mutationObserver?.observe(element, {
			childList: true,
			characterData: true,
			subtree: true,
		})

		return () => {
			resizeObserver?.disconnect()
			mutationObserver?.disconnect()
		}
	}, [enabled, minFontSizePx, text])

	return ref
}
