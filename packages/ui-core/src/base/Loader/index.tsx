// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentBaseWithClassName } from 'types'
import classes from './index.module.scss'

export const Loader = ({
	as: Element = 'div',
	className,
	style,
}: ComponentBaseWithClassName & { as?: 'div' | 'span' }) => (
	<Element className={classNames(classes.loader, className)} style={style} />
)
