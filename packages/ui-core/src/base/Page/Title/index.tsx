// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import type { PageTitleProps } from 'types'
import classes from './index.module.scss'

/**
 * @name Title
 * @summary
 * The element that wraps a page title. Determines the padding and position relative to top of
 * screen when the element is stuck.
 */
export const Title = ({ title, children }: Omit<PageTitleProps, 'tabs'>) => {
	const [sticky, setSticky] = useState(false)
	const ref = useRef<HTMLElement>(null)

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => setSticky(entry.intersectionRatio < 1),
			{ threshold: [1], rootMargin: '-1px 0px 0px 0px' },
		)
		if (ref.current) {
			observer.observe(ref.current)
		}
		return () => {
			if (ref.current) {
				observer.unobserve(ref.current)
			}
		}
	}, [])

	const headerClasses = classNames(classes.pageTitle, {
		[classes.default]: !sticky,
		[classes.sticky]: sticky,
	})
	const h1Classes = classNames(classes.text, {
		[classes.default]: !sticky,
		[classes.sticky]: sticky,
	})

	return (
		<>
			<div className={classes.scroll} />
			<header className={headerClasses} ref={ref}>
				<section className={classes.title}>
					<div>
						<h1 className={h1Classes}>{title}</h1>
					</div>
				</section>
				{children}
			</header>
		</>
	)
}
