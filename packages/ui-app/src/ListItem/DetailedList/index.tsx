// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import {
	type ComponentPropsWithoutRef,
	type CSSProperties,
	createElement,
	type ReactNode,
} from 'react'
import type { DisplayFor } from 'types'
import { Loader } from 'ui-core/base'
import classes from './index.module.scss'
import { DetailedListSkeleton } from './Skeleton'

interface ItemShellProps extends ComponentPropsWithoutRef<'div'> {
	displayFor?: DisplayFor
	layout: 'card' | 'row'
	selected?: boolean
	statusAccent?: 'success' | 'warning' | 'danger'
}

const ItemShell = ({
	children,
	className,
	displayFor,
	layout,
	selected,
	statusAccent,
	...props
}: ItemShellProps) => (
	<div
		{...props}
		className={classNames(
			classes.item,
			layout === 'card' ? classes.card : classes.bar,
			className,
		)}
	>
		<div
			className={classNames(classes.surface, {
				[classes.card]: displayFor === 'card',
				[classes.selected]: selected,
			})}
			data-status-accent={statusAccent}
		>
			{layout === 'row' ? (
				<div className={classes.barLayout}>{children}</div>
			) : (
				children
			)}
		</div>
	</div>
)

type ItemRootProps = Omit<ItemShellProps, 'layout'>

const DetailedCardRoot = (props: ItemRootProps) => (
	<ItemShell layout="card" {...props} />
)

type ClassedElement = 'button' | 'div' | 'header' | 'section' | 'span' | 'time'

const withClassName = <T extends ClassedElement>(
	tag: T,
	baseClassName: string,
) => {
	const Component = ({ className, ...props }: ComponentPropsWithoutRef<T>) =>
		createElement(tag, {
			...props,
			className: classNames(baseClassName, className),
		})

	Component.displayName = baseClassName
	return Component
}

const ListItemRow = (props: ItemRootProps) => (
	<ItemShell layout="row" {...props} />
)

const ListItemSkeleton = ({
	format,
	label,
}: {
	format: 'row' | 'col'
	label: string
}) => (
	<ItemShell
		layout={format === 'row' ? 'row' : 'card'}
		aria-busy="true"
		aria-label={label}
	>
		<DetailedListSkeleton format={format} />
	</ItemShell>
)

interface ListItemActionProps extends ComponentPropsWithoutRef<'div'> {
	wide?: boolean
}

const ListItemAction = ({ className, wide, ...props }: ListItemActionProps) => (
	<div
		{...props}
		className={classNames(wide && classes.metricsAction, className)}
	/>
)

interface ListItemMetricProps extends ComponentPropsWithoutRef<'div'> {
	children: ReactNode
	color?: CSSProperties['color']
	label: ReactNode
	labelProps?: ComponentPropsWithoutRef<'span'>
	valueProps?: ComponentPropsWithoutRef<'strong'>
}

const ListItemMetric = ({
	children,
	color,
	label,
	labelProps,
	valueProps,
	...props
}: ListItemMetricProps) => (
	<div {...props}>
		<span {...labelProps}>{label}</span>
		<strong
			{...valueProps}
			style={{ ...valueProps?.style, color: color ?? valueProps?.style?.color }}
		>
			{children}
		</strong>
	</div>
)

const ListItemStatusDot = ({
	active,
	className,
	...props
}: ComponentPropsWithoutRef<'span'> & { active: boolean }) => (
	<span
		{...props}
		className={classNames(classes.statusDot, className)}
		data-active={active}
	/>
)

const ListItemGraph = ({
	className,
	layout,
	...props
}: ComponentPropsWithoutRef<'div'> & { layout: 'card' | 'row' }) => (
	<div
		{...props}
		className={classNames(
			classes.graph,
			layout === 'card' ? classes.cardGraph : classes.barGraph,
			className,
		)}
	/>
)

interface DetailLoaderProps {
	borderRadius?: string
	height?: string
	width?: string
}

const ListItemDetailLoader = ({
	borderRadius = '0.35rem',
	height = '1.45rem',
	width = '6rem',
}: DetailLoaderProps) => (
	<Loader
		style={{
			borderRadius,
			display: 'block',
			height,
			maxWidth: '100%',
			width,
		}}
	/>
)

export type ListItemFormat = 'row' | 'col'

interface ListItemFormatToggleProps {
	hideOnCompact?: boolean
	onChange: (format: ListItemFormat) => void
	value: ListItemFormat
}

const ListItemFormatToggle = ({
	hideOnCompact,
	onChange,
	value,
}: ListItemFormatToggleProps) => {
	return (
		<div
			className={classNames(
				classes.formatToggle,
				hideOnCompact && classes.hideOnCompact,
			)}
		>
			<button
				type="button"
				onClick={() => onChange('row')}
				aria-pressed={value === 'row'}
			>
				<FontAwesomeIcon icon={faBars} />
			</button>
			<button
				type="button"
				onClick={() => onChange('col')}
				aria-pressed={value === 'col'}
			>
				<FontAwesomeIcon icon={faGripVertical} />
			</button>
		</div>
	)
}

export const DetailedCard = {
	Header: withClassName('div', classes.cardHeader),
	Root: DetailedCardRoot,
	Top: withClassName('div', classes.cardTop),
}

export const ListItem = {
	Action: ListItemAction,
	Actions: withClassName('div', classes.actions),
	Activity: withClassName('section', classes.activity),
	Blocked: withClassName('span', classes.blocked),
	DetailLoader: ListItemDetailLoader,
	FormatToggle: ListItemFormatToggle,
	Graph: ListItemGraph,
	Identity: withClassName('div', classes.identity),
	MenuTrigger: withClassName('button', classes.menuTrigger),
	Metric: ListItemMetric,
	Month: withClassName('time', classes.month),
	Retainment: withClassName('section', classes.retainment),
	RetainmentGrid: withClassName('div', classes.retainmentGrid),
	Row: ListItemRow,
	RowIdentity: withClassName('div', classes.barIdentity),
	RowMetrics: withClassName('div', classes.barStats),
	SectionHeader: withClassName('header', classes.sectionHeader),
	Skeleton: ListItemSkeleton,
	StatusDot: ListItemStatusDot,
	Summary: withClassName('section', classes.summaryGrid),
}
