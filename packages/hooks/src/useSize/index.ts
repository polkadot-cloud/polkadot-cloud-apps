// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

// Define the type for the options parameter.
interface UseSizeOptions {
	outerElement?: RefObject<HTMLElement | null>
	throttle?: number
}

// Custom hook to get the width and height of a specified element. Updates the `size` state when the
// specified "outer element" (or the window by default) resizes.
export const useSize = (
	element: RefObject<HTMLElement | null>,
	options: UseSizeOptions = {},
) => {
	const { outerElement, throttle: throttleDuration = 100 } = options

	// Helper function to retrieve the width and height of an element
	// If no element is found, default dimensions are set to 0.
	const getSize = (el: HTMLElement | null = null) => {
		const width = el?.offsetWidth || 0
		const height = el?.offsetHeight || 0
		return { width, height }
	}

	// Ref to store the last execution time of the `resizeThrottle` handler.
	const lastExecutedRef = useRef<number>(0)

	// State to store the current width and height of the specified element.
	const [size, setSize] = useState<{ width: number; height: number }>(
		getSize(element?.current),
	)

	// Throttle the resize event handler to limit how often size updates occur.
	const handleResize = () => {
		const now = Date.now()
		if (now - lastExecutedRef.current < throttleDuration) {
			return
		} // Exit if `throttleDuration` has not passed.

		lastExecutedRef.current = now // Update last execution time.

		setSize(getSize(element?.current))
	}

	// Set up the resize event listener on mount and clean it up on unmount.
	useEffect(() => {
		// Determine the target for the resize event listener.
		// If `outerElement` is provided, listen to its resize events; otherwise, listen to the window's.
		const listenFor = outerElement?.current || window

		listenFor.addEventListener('resize', handleResize)

		// Clean up event listener when the component unmounts to avoid memory leaks.
		return () => {
			listenFor.removeEventListener('resize', handleResize)
		}
	}, [outerElement?.current])

	// Return the current size of the element.
	return size
}
