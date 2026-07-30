// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback, useLayoutEffect, useRef } from 'react'

interface FitTextOptions {
	// Whether fitting is active. When false (e.g. the element is not rendered),
	// no measurement is performed.
	enabled?: boolean
	// The smallest font size, in pixels, the text is allowed to shrink to before
	// it is left to overflow (handled by CSS, e.g. ellipsis).
	minFontSizePx?: number
}

// Keeps a single-line text element fitting within its container by scaling its
// font size down when the text would otherwise overflow. Re-fits whenever the
// text changes (e.g. a language switch) or the container resizes, and leaves the
// element at its natural CSS size whenever it already fits.
//
// The target element should be styled to stay on one line (`white-space: nowrap`)
// within a width-constrained parent so that `scrollWidth`/`clientWidth` reflect
// the natural vs. available width.
export const useFitText = <T extends HTMLElement>(
	text: string,
	{ enabled = true, minFontSizePx = 11 }: FitTextOptions = {},
) => {
	const ref = useRef<T>(null)

	const fit = useCallback(() => {
		const el = ref.current
		if (!el) {
			return
		}
		// Reset to the inherited/base size before measuring so sizing never
		// compounds across re-fits.
		el.style.fontSize = ''
		const base = Number.parseFloat(getComputedStyle(el).fontSize)
		if (!base || el.clientWidth === 0) {
			return
		}
		// `scrollWidth` is the un-clipped single-line width; if it exceeds the
		// available `clientWidth`, scale the font down proportionally to fit.
		if (el.scrollWidth > el.clientWidth) {
			const scaled = (base * el.clientWidth) / el.scrollWidth
			el.style.fontSize = `${Math.max(minFontSizePx, Math.floor(scaled))}px`
		}
	}, [minFontSizePx])

	useLayoutEffect(() => {
		if (!enabled) {
			return
		}
		fit()
		// Observe the parent rather than the element itself: re-fitting changes the
		// element's own size and would otherwise trigger an observer feedback loop.
		const target = ref.current?.parentElement
		if (!target || typeof ResizeObserver === 'undefined') {
			return
		}
		const observer = new ResizeObserver(() => fit())
		observer.observe(target)
		return () => observer.disconnect()
	}, [fit, text, enabled])

	return ref
}
