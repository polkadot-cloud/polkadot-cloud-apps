// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader } from 'ui-core/base'
import classes from './index.module.scss'

interface ItemShellProps extends ComponentPropsWithoutRef<'div'> {
	canvas?: boolean
	layout: 'card' | 'row'
	selected?: boolean
	surfaceChildren?: ReactNode
}

const ItemShell = ({
	canvas = false,
	children,
	className,
	layout,
	selected = false,
	surfaceChildren,
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
				[classes.canvas]: canvas,
				[classes.selected]: selected,
			})}
		>
			{surfaceChildren ?? children}
		</div>
	</div>
)

interface ItemRootProps extends ComponentPropsWithoutRef<'div'> {
	canvas?: boolean
	selected?: boolean
}

const DetailedCardRoot = ({ canvas, selected, ...props }: ItemRootProps) => (
	<ItemShell layout="card" canvas={canvas} selected={selected} {...props} />
)

const DetailedCardTop = ({
	className,
	...props
}: ComponentPropsWithoutRef<'div'>) => (
	<div {...props} className={classNames(classes.cardTop, className)} />
)

const DetailedCardHeader = ({
	className,
	...props
}: ComponentPropsWithoutRef<'div'>) => (
	<div {...props} className={classNames(classes.cardHeader, className)} />
)

const ListItemRow = ({
	canvas,
	children,
	selected,
	...props
}: ItemRootProps) => (
	<ItemShell
		layout="row"
		canvas={canvas}
		selected={selected}
		{...props}
		surfaceChildren={<div className={classes.barLayout}>{children}</div>}
	/>
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
		<Loader
			style={{
				borderRadius: '0.5rem',
				display: 'block',
				height: format === 'row' ? '5.5rem' : '29.5rem',
				width: '100%',
			}}
		/>
	</ItemShell>
)

const ListItemIdentity = ({
	className,
	...props
}: ComponentPropsWithoutRef<'div'>) => (
	<div {...props} className={classNames(classes.identity, className)} />
)

const ListItemBlocked = ({
	className,
	...props
}: ComponentPropsWithoutRef<'span'>) => (
	<span {...props} className={classNames(classes.blocked, className)} />
)

const ListItemActions = ({
	className,
	...props
}: ComponentPropsWithoutRef<'div'>) => (
	<div {...props} className={classNames(classes.actions, className)} />
)

interface ListItemActionProps extends ComponentPropsWithoutRef<'div'> {
	wide?: boolean
}

const ListItemAction = ({
	className,
	wide = false,
	...props
}: ListItemActionProps) => (
	<div
		{...props}
		className={classNames(wide && classes.metricsAction, className)}
	/>
)

const ListItemMenuTrigger = ({
	className,
	...props
}: ComponentPropsWithoutRef<'button'>) => (
	<button {...props} className={classNames(classes.menuTrigger, className)} />
)

const ListItemRowIdentity = ({
	className,
	...props
}: ComponentPropsWithoutRef<'div'>) => (
	<div {...props} className={classNames(classes.barIdentity, className)} />
)

const ListItemSummary = ({
	className,
	...props
}: ComponentPropsWithoutRef<'section'>) => (
	<section {...props} className={classNames(classes.summaryGrid, className)} />
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

const ListItemRetainmentGrid = ({
	className,
	...props
}: ComponentPropsWithoutRef<'div'>) => (
	<div {...props} className={classNames(classes.retainmentGrid, className)} />
)

const ListItemRowMetrics = ({
	className,
	...props
}: ComponentPropsWithoutRef<'div'>) => (
	<div {...props} className={classNames(classes.barStats, className)} />
)

const ListItemSectionHeader = ({
	className,
	...props
}: ComponentPropsWithoutRef<'header'>) => (
	<header {...props} className={classNames(classes.sectionHeader, className)} />
)

const ListItemActivity = ({
	className,
	...props
}: ComponentPropsWithoutRef<'section'>) => (
	<section {...props} className={classNames(classes.activity, className)} />
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

const ListItemRetainment = ({
	className,
	...props
}: ComponentPropsWithoutRef<'section'>) => (
	<section {...props} className={classNames(classes.retainment, className)} />
)

const ListItemMonth = ({
	className,
	...props
}: ComponentPropsWithoutRef<'time'>) => (
	<time {...props} className={classNames(classes.month, className)} />
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
	hideOnCompact = false,
	onChange,
	value,
}: ListItemFormatToggleProps) => {
	const { t } = useTranslation('app')
	const wrapperClasses = classNames(classes.formatToggle, {
		[classes.hideOnCompact]: hideOnCompact,
	})

	return (
		<div className={wrapperClasses}>
			<button
				type="button"
				onClick={() => onChange('row')}
				aria-label={t('rowView', {
					defaultValue: 'Compact row view',
				})}
				aria-pressed={value === 'row'}
			>
				<FontAwesomeIcon icon={faBars} />
			</button>
			<button
				type="button"
				onClick={() => onChange('col')}
				aria-label={t('cardView', { defaultValue: 'Detailed card view' })}
				aria-pressed={value === 'col'}
			>
				<FontAwesomeIcon icon={faGripVertical} />
			</button>
		</div>
	)
}

export const DetailedCard = {
	Header: DetailedCardHeader,
	Root: DetailedCardRoot,
	Top: DetailedCardTop,
}

export const ListItem = {
	Action: ListItemAction,
	Actions: ListItemActions,
	Activity: ListItemActivity,
	Blocked: ListItemBlocked,
	DetailLoader: ListItemDetailLoader,
	FormatToggle: ListItemFormatToggle,
	Graph: ListItemGraph,
	Identity: ListItemIdentity,
	MenuTrigger: ListItemMenuTrigger,
	Metric: ListItemMetric,
	Month: ListItemMonth,
	Retainment: ListItemRetainment,
	RetainmentGrid: ListItemRetainmentGrid,
	Row: ListItemRow,
	RowIdentity: ListItemRowIdentity,
	RowMetrics: ListItemRowMetrics,
	SectionHeader: ListItemSectionHeader,
	Skeleton: ListItemSkeleton,
	StatusDot: ListItemStatusDot,
	Summary: ListItemSummary,
}
