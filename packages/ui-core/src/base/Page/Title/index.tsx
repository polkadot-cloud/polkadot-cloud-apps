// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import type { PageTitleProps } from 'types'
import classes from './index.module.scss'

/**
 * @name Title
 * @summary
 * The element that wraps a page title. Determines the padding and position relative to top of
 * screen when the element is stuck.
 */
export const Title = ({
	title,
	titleActions,
	children,
	standalone = false,
}: Omit<PageTitleProps, 'tabs'> & {
	titleActions?: ReactNode
	standalone?: boolean
}) => {
	const [sticky, setSticky] = useState(false)
	const ref = useRef<HTMLElement>(null)

	useEffect(() => {
		const element = ref.current
		if (!element) return

		let observer: IntersectionObserver
		const observeSticky = () => {
			observer?.disconnect()
			const top = Number.parseFloat(getComputedStyle(element).top) || 0
			observer = new IntersectionObserver(
				([entry]) => setSticky(entry.intersectionRatio < 1),
				{ threshold: [1], rootMargin: `-${top + 1}px 0px 0px 0px` },
			)
			observer.observe(element)
		}

		observeSticky()
		window.addEventListener('resize', observeSticky)
		return () => {
			observer.disconnect()
			window.removeEventListener('resize', observeSticky)
		}
	}, [])

	const headerClasses = classNames(classes.pageTitle, {
		[classes.default]: !sticky,
		[classes.sticky]: sticky,
		[classes.standalone]: standalone,
	})
	const h1Classes = classNames(classes.text, {
		[classes.default]: !sticky,
		[classes.sticky]: sticky,
	})

	return (
		<>
			<div className={classes.scroll} />
			<header className={headerClasses} ref={ref}>
				<section
					className={classNames(classes.title, {
						[classes.withActions]: !!titleActions,
					})}
				>
					<div>
						<h1 className={h1Classes}>{title}</h1>
					</div>
					{titleActions}
				</section>
				{children}
			</header>
		</>
	)
}
