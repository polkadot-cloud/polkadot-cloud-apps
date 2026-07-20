// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import classes from './index.module.scss'
import type {
	SearchListClearButtonProps,
	SearchListColumnProps,
	SearchListContainerProps,
	SearchListEmptyStateProps,
	SearchListHeaderProps,
	SearchListLoadingProps,
	SearchListNominationsCounterProps,
	SearchListNoResultsProps,
	SearchListSelectedListProps,
} from './types'

const Container = ({
	children,
	className,
	style,
}: SearchListContainerProps) => (
	<div className={classNames(classes.container, className)} style={style}>
		{children}
	</div>
)

const LeftColumn = ({ children, className, style }: SearchListColumnProps) => (
	<div className={classNames(classes.leftColumn, className)} style={style}>
		{children}
	</div>
)

const RightColumn = ({ children, className, style }: SearchListColumnProps) => (
	<div className={classNames(classes.rightColumn, className)} style={style}>
		{children}
	</div>
)

const Header = ({ children, className, style }: SearchListHeaderProps) => (
	<h5 className={classNames(classes.header, className)} style={style}>
		{children}
	</h5>
)

const SearchHeader = ({
	children,
	className,
	style,
}: SearchListHeaderProps) => (
	<h5 className={classNames(classes.searchHeader, className)} style={style}>
		{children}
	</h5>
)

const SelectedList = ({
	children,
	className,
	style,
}: SearchListSelectedListProps) => (
	<div className={classNames(classes.selectedList, className)} style={style}>
		{children}
	</div>
)

const EmptyState = ({
	message,
	className,
	style,
}: SearchListEmptyStateProps) => (
	<div className={classNames(classes.emptyState, className)} style={style}>
		{message}
	</div>
)

const Loading = ({ message, className, style }: SearchListLoadingProps) => (
	<div className={classNames(classes.loadingWrapper, className)} style={style}>
		{message}
	</div>
)

const NoResults = ({ message, className, style }: SearchListNoResultsProps) => (
	<div
		className={classNames(classes.noResultsWrapper, className)}
		style={style}
	>
		{message}
	</div>
)

const ClearButton = ({
	onClick,
	children,
	className,
	style,
}: SearchListClearButtonProps) => (
	<div style={{ marginTop: '0.5rem' }}>
		<button
			type="button"
			onClick={onClick}
			className={classNames(classes.clearButton, className)}
			style={style}
		>
			{children}
		</button>
	</div>
)

const NominationsCounter = ({
	current,
	total,
	remaining,
	className,
	style,
}: SearchListNominationsCounterProps) => (
	<div
		className={classNames(classes.nominationsCounter, className)}
		style={style}
	>
		<span className={classes.nominationsText}>
			Your Nominations: {current} / {total}
		</span>
		<span
			className={classNames({
				[classes.remainingText]: true,
				[classes.hasRemaining]: remaining > 0,
				[classes.noRemaining]: remaining <= 0,
			})}
		>
			{remaining} Remaining
		</span>
	</div>
)

export const SearchList = {
	Container,
	LeftColumn,
	RightColumn,
	Header,
	SearchHeader,
	SelectedList,
	EmptyState,
	Loading,
	NoResults,
	ClearButton,
	NominationsCounter,
}
