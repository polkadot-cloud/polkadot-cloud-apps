// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

interface UseOnResizeOptions {
	outerElement?: RefObject<HTMLElement | null>
	throttle?: number
}

/**
 * Custom hook that triggers a callback function when the specified element
 * or the window is resized.
 *
 * @param callback - The function to be executed on resize.
 * @param options - Optional parameters to customize the behavior:
 *   - outerElement: A ref to an HTMLElement to listen for resize events.
 *   - throttle: Optional duration in milliseconds to throttle the callback execution.
 *               Default is 100 milliseconds.
 */
export const useOnResize = (
	callback: () => void,
	options: UseOnResizeOptions = {},
) => {
	const { outerElement, throttle: throttleDuration = 100 } = options
	const lastExecutedRef = useRef<number>(0)

	// Throttled resize handler to limit the frequency of callback execution.
	const handleResize = () => {
		const now = Date.now()

		// Check if the callback can be executed based on the throttle duration.
		if (now - lastExecutedRef.current < throttleDuration) {
			return
		}

		lastExecutedRef.current = now
		callback()
	}

	useEffect(() => {
		// Determine the target for the resize event listener.
		const target = outerElement?.current || window

		// Add the resize event listener when the component mounts.
		target.addEventListener('resize', handleResize)

		// Clean up the event listener when the component unmounts.
		return () => {
			target.removeEventListener('resize', handleResize)
		}
	}, [throttleDuration, callback])
}
