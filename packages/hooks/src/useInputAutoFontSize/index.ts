// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export type UseInputAutoFontSizeOptions = {
	value?: string | number
	overflowPadding?: number
}

export const useInputAutoFontSize = <
	T extends HTMLInputElement = HTMLInputElement,
>({
	value,
	overflowPadding = 2,
}: UseInputAutoFontSizeOptions = {}) => {
	const inputRef = useRef<T>(null)
	const measureRef = useRef<HTMLSpanElement>(null)
	const baseInlineFontSize = useRef<string | undefined>(undefined)
	const [fontSize, setFontSize] = useState<number>()
	const controlled = value !== undefined

	const fitInputValue = useCallback(() => {
		const input = inputRef.current
		if (!input || typeof document === 'undefined') {
			return
		}

		if (baseInlineFontSize.current === undefined) {
			baseInlineFontSize.current = input.style.fontSize
		}

		const fittedInlineFontSize = input.style.fontSize
		input.style.fontSize = baseInlineFontSize.current
		const inputStyles = window.getComputedStyle(input)
		const naturalStyles = {
			fontFamily: inputStyles.fontFamily,
			fontSize: inputStyles.fontSize,
			fontStyle: inputStyles.fontStyle,
			fontVariant: inputStyles.fontVariant,
			fontWeight: inputStyles.fontWeight,
			fontStretch: inputStyles.fontStretch,
			letterSpacing: inputStyles.letterSpacing,
			textTransform: inputStyles.textTransform,
			paddingLeft: inputStyles.paddingLeft,
			paddingRight: inputStyles.paddingRight,
		}
		input.style.fontSize = fittedInlineFontSize
		const naturalFontSize = Number.parseFloat(naturalStyles.fontSize)

		const availableWidth = Math.max(
			input.clientWidth -
				Number.parseFloat(naturalStyles.paddingLeft) -
				Number.parseFloat(naturalStyles.paddingRight) -
				overflowPadding,
			0,
		)

		let measure = measureRef.current
		if (!measure) {
			measure = document.createElement('span')
			measure.setAttribute('aria-hidden', 'true')
			Object.assign(measure.style, {
				position: 'fixed',
				left: '-9999px',
				top: '0',
				visibility: 'hidden',
				whiteSpace: 'pre',
				pointerEvents: 'none',
			})
			document.body.append(measure)
			measureRef.current = measure
		}

		Object.assign(measure.style, {
			fontFamily: naturalStyles.fontFamily,
			fontSize: naturalStyles.fontSize,
			fontStyle: naturalStyles.fontStyle,
			fontVariant: naturalStyles.fontVariant,
			fontWeight: naturalStyles.fontWeight,
			fontStretch: naturalStyles.fontStretch,
			letterSpacing: naturalStyles.letterSpacing,
			textTransform: naturalStyles.textTransform,
		})
		measure.textContent = input.value || input.placeholder

		const measuredWidth = measure.getBoundingClientRect().width
		const nextFontSize =
			availableWidth > 0 && measuredWidth > availableWidth
				? Math.floor(naturalFontSize * (availableWidth / measuredWidth) * 100) /
					100
				: undefined

		setFontSize((currentFontSize) =>
			currentFontSize === nextFontSize ? currentFontSize : nextFontSize,
		)
	}, [overflowPadding])

	useLayoutEffect(() => {
		fitInputValue()
	}, [fitInputValue, value])

	useLayoutEffect(() => {
		const input = inputRef.current
		if (!input) {
			return
		}
		let active = true

		if (!controlled) {
			input.addEventListener('input', fitInputValue)
		}
		window.addEventListener('resize', fitInputValue)

		const resizeObserver =
			typeof ResizeObserver === 'undefined'
				? undefined
				: new ResizeObserver(fitInputValue)
		resizeObserver?.observe(input)

		document.fonts?.ready.then(() => {
			if (active) {
				fitInputValue()
			}
		})

		return () => {
			active = false
			if (!controlled) {
				input.removeEventListener('input', fitInputValue)
			}
			window.removeEventListener('resize', fitInputValue)
			resizeObserver?.disconnect()
		}
	}, [controlled, fitInputValue])

	useLayoutEffect(
		() => () => {
			measureRef.current?.remove()
			measureRef.current = null
		},
		[],
	)

	return {
		inputRef,
		fontSize,
	}
}
