// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type React from 'react'
import classes from './index.module.scss'

export interface SupportProps {
	className?: string
	children: React.ReactNode
}

export const Support = ({ className, children }: SupportProps) => (
	<div className={classNames(classes.support, className)}>{children}</div>
)
