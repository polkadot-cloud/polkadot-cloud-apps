// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { PageTitleProps, PageTitleTabProps } from 'types'
import { ButtonTab, ButtonTabPreloader } from 'ui-buttons'
import classes from './index.module.scss'

export const PageTabs = ({
	sticky,
	tabs = [],
	inline = false,
	tabClassName,
	colorSecondary,
	preloading = false,
	preloaderTabs = 1,
}: PageTitleProps) => {
	const buttonClasses = classNames(classes.pageTitleTabs, {
		[classes.inline]: inline,
		[classes.sticky]: sticky,
	})
	const tabPreloaders = Array.from({ length: preloaderTabs }, (_, i) => i + 1)

	return (
		<section className={buttonClasses}>
			<div className={classes.scroll}>
				<div className={classes.inner}>
					{tabs.map(
						({
							active,
							onClick,
							title,
							badge,
							disabled,
						}: PageTitleTabProps) => (
							<ButtonTab
								className={tabClassName}
								active={!!active}
								key={`page_tab_${title}`}
								onClick={() => onClick()}
								title={title}
								colorSecondary={colorSecondary}
								badge={badge}
								disabled={disabled === undefined ? false : disabled}
							/>
						),
					)}
					{preloading &&
						tabPreloaders.map((tabPreloader) => (
							<ButtonTabPreloader
								className={tabClassName}
								colorSecondary={colorSecondary}
								key={`page_tab_preloader_${tabPreloader}`}
							/>
						))}
				</div>
			</div>
		</section>
	)
}
