// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ComponentPropsWithoutRef } from 'react'
import classes from './index.module.scss'

type ItemKind = 'member' | 'pool'

interface RootProps extends ComponentPropsWithoutRef<'div'> {
	canvas?: boolean
	kind?: ItemKind
	selected?: boolean
}

const Root = ({
	canvas = false,
	children,
	className,
	kind,
	selected = false,
	...props
}: RootProps) => (
	<div
		{...props}
		className={classNames(
			classes.item,
			kind === 'member' && classes.member,
			kind === 'pool' && classes.pool,
			className,
		)}
	>
		<div
			className={classNames(classes.surface, {
				[classes.canvas]: canvas,
				[classes.selected]: selected,
			})}
		>
			{children}
		</div>
	</div>
)

interface RowProps extends ComponentPropsWithoutRef<'div'> {
	large?: boolean
	pools?: boolean
	position: 'top' | 'bottom'
}

const Row = ({
	className,
	large = false,
	pools = false,
	position,
	...props
}: RowProps) => (
	<div
		{...props}
		className={classNames(
			classes.row,
			classes[position],
			large && classes.large,
			pools && classes.pools,
			className,
		)}
	/>
)

interface PoolStatusProps extends ComponentPropsWithoutRef<'div'> {
	status?: string | null
}

const PoolStatus = ({ className, status, ...props }: PoolStatusProps) => (
	<div
		{...props}
		className={classNames(classes.poolStatus, className)}
		data-status={status ?? undefined}
	/>
)

export const BasicItem = {
	PoolStatus,
	Root,
	Row,
}
