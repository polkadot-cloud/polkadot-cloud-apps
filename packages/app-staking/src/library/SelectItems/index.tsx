// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactElement, ReactNode, RefObject } from 'react'
import {
	cloneElement,
	createRef,
	Fragment,
	useEffect,
	useLayoutEffect,
	useMemo,
} from 'react'
import type { SelectItemsProps } from './types'
import { SelectItemsWrapper, TwoThreshold } from './Wrapper'

export const SelectItems = ({ layout, children }: SelectItemsProps) => {
	// Initialise refs for container and body of items.
	const refs = Array.isArray(children) ? children : []
	const containerRefs = useMemo(
		() => refs.map(() => createRef<HTMLDivElement>()),
		[refs.length],
	)
	const bodyRefs = useMemo(
		() => refs.map(() => createRef<HTMLDivElement>()),
		[refs.length],
	)

	// Adjust all container heights to be uniform.
	const handleAdjustHeight = () => {
		const refsInitialised = [...containerRefs]
			.concat(bodyRefs)
			.every((r: RefObject<HTMLDivElement | null>) => r?.current !== null)

		if (refsInitialised) {
			// Get max height from button refs.
			let maxHeight = 0
			for (const { current: currentBody } of bodyRefs) {
				const thisHeight = currentBody?.offsetHeight || 0
				if (thisHeight > maxHeight) {
					maxHeight = thisHeight
				}
			}

			// Update container heights to max height.
			let i = 0
			for (const { current: currentContainer } of containerRefs) {
				if (currentContainer) {
					const icon: HTMLElement | null =
						currentContainer.querySelector('.icon')
					const toggle: HTMLElement | null =
						currentContainer.querySelector('.toggle')

					if (window.innerWidth <= TwoThreshold) {
						currentContainer.style.height = `${
							bodyRefs[i].current?.offsetHeight || 0
						}px`
						if (icon) {
							icon.style.height = `${bodyRefs[i].current?.offsetHeight || 0}px`
						}
						if (toggle) {
							toggle.style.height = `${
								bodyRefs[i].current?.offsetHeight || 0
							}px`
						}
					} else {
						currentContainer.style.height = `${maxHeight}px`
						if (icon) {
							icon.style.height = `${maxHeight}px`
						}
						if (toggle) {
							toggle.style.height = `${maxHeight}px`
						}
					}
				}
				i++
			}
		}
	}

	// Update on ref change.
	useLayoutEffect(() => {
		handleAdjustHeight()
	}, [children, bodyRefs, containerRefs])

	// Adjust height on window resize.
	useEffect(() => {
		window.addEventListener('resize', handleAdjustHeight)
		return () => {
			window.removeEventListener('resize', handleAdjustHeight)
		}
	}, [])

	return (
		<SelectItemsWrapper className={layout}>
			{children
				? children.map((child: ReactNode, i: number) => {
						if (child !== undefined) {
							return (
								<Fragment
									key={`select_${
										// biome-ignore lint/suspicious/noArrayIndexKey: <working with a react node>
										i
									}`}
								>
									{/* biome-ignore lint/suspicious/noExplicitAny: <> */}
									{cloneElement(child as ReactElement<any>, {
										bodyRef: bodyRefs[i],
										containerRef: containerRefs[i],
									})}
								</Fragment>
							)
						}
						return null
					})
				: null}
		</SelectItemsWrapper>
	)
}
