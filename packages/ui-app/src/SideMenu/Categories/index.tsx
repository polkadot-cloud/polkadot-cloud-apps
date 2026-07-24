// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOutsideAlerter } from '@w3ux/hooks'
import classNames from 'classnames'
import { usePageFromHash } from 'hooks/usePageFromHash'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { CategoriesPopoverProps } from '../types'
import classes from './index.module.scss'

export const CategoriesPopover = ({
	getActivePageForCategory,
	pageCategories,
	pagesConfig,
	setOpen,
}: CategoriesPopoverProps) => {
	const { t } = useTranslation('app')
	const navigate = useNavigate()
	const { categoryKey } = usePageFromHash({
		pageCategories,
		pagesConfig,
	})

	const popoverRef = useRef<HTMLDivElement>(null)

	// Close the menu if clicked outside of its container
	useOutsideAlerter(popoverRef, () => {
		setOpen(false)
	}, ['menu-categories'])

	return (
		<div ref={popoverRef}>
			<div className={classes.inner}>
				{pageCategories.map((category) => {
					const allClasses = classNames(classes.button, {
						[classes.active]: category.key === categoryKey,
					})

					return (
						<button
							type="button"
							onClick={() => {
								setOpen(false)
								navigate(getActivePageForCategory(category.key))
							}}
							className={allClasses}
							key={category.id}
						>
							{t(category.key)}
						</button>
					)
				})}
			</div>
		</div>
	)
}
