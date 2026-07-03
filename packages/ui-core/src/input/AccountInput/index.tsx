// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ellipsisFn } from '@w3ux/utils'
import classNames from 'classnames'
import { type FunctionComponent, forwardRef, type SVGProps } from 'react'
import type {
	ComponentBase,
	ComponentBaseWithClassName,
	ImportedAccount,
} from 'types'
import type { AccountInputProps } from '../types'
import classes from './index.module.scss'

const Container = forwardRef<
	HTMLDivElement,
	ComponentBaseWithClassName & { disabled?: boolean; listOpen: boolean }
>(({ children, style, className, disabled, listOpen }, ref) => {
	const allClasses = classNames(classes.container, className, {
		[classes.disabled]: !!disabled,
		[classes.listOpen]: listOpen,
	})
	return (
		<div className={allClasses} style={style} ref={ref}>
			{children}
		</div>
	)
})

const InnerLeft = ({ children, style }: ComponentBase) => {
	return (
		<div className={classes.innerLeft} style={style}>
			{children}
		</div>
	)
}

const InnerRight = ({ children, style }: ComponentBase) => {
	return (
		<div className={classes.innerRight} style={style}>
			{children}
		</div>
	)
}

const Input = forwardRef<HTMLInputElement, AccountInputProps>(
	({ style, placeholder, value, onChange, onFocus, onBlur, disabled }, ref) => {
		const allClasses = classNames(classes.input, {
			[classes.disabled]: !!disabled,
			[classes.enabled]: !disabled,
		})

		return (
			<input
				type="text"
				name="account-search"
				value={value}
				className={allClasses}
				style={style}
				ref={ref}
				placeholder={placeholder}
				onChange={onChange}
				onFocus={onFocus}
				onBlur={onBlur}
				autoComplete="off"
				autoCorrect="off"
				maxLength={60}
				disabled={disabled}
			/>
		)
	},
)

const Address = ({ address, style }: ComponentBase & { address: string }) => {
	return (
		<div className={classes.address} style={style}>
			{ellipsisFn(address)}
		</div>
	)
}

const SourceIcon = ({
	SvgIcon,
	faIcon,
}: {
	SvgIcon?: FunctionComponent<SVGProps<SVGSVGElement>>
	faIcon?: IconDefinition
}) => {
	if (SvgIcon) {
		return (
			<span className={classes.sourceIcon}>
				<SvgIcon />
			</span>
		)
	}
	if (faIcon) {
		return (
			<span className={classes.sourceIcon}>
				<FontAwesomeIcon icon={faIcon} />
			</span>
		)
	}

	return null
}

const Balance = ({
	style,
	label,
	value,
	unit,
}: ComponentBase & { label: string; value: string; unit: string }) => {
	return (
		<h4 className={classes.balance} style={style}>
			{label}: {value} {unit}
		</h4>
	)
}

const ListContainer = forwardRef<HTMLDivElement, ComponentBaseWithClassName>(
	({ children, style, className }, ref) => {
		return (
			<div
				className={classNames(classes.listContainer, className)}
				style={style}
				ref={ref}
				role="listbox"
				aria-label="Account selection"
			>
				{children}
			</div>
		)
	},
)

const ListItem = ({
	account,
	isSelected,
	onClick,
	onKeyDown,
	children,
}: ComponentBase & {
	account: ImportedAccount
	isSelected: boolean
	onClick: (account: ImportedAccount) => void
	onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
}) => {
	const allClasses = classNames(classes.listItem, {
		[classes.selected]: isSelected,
	})
	return (
		<div
			className={allClasses}
			onClick={() => onClick(account)}
			onKeyDown={(ev) => onKeyDown(ev)}
			role="option"
			tabIndex={0}
			aria-selected={isSelected}
		>
			{children}
		</div>
	)
}

const ListName = ({ name, style }: ComponentBase & { name: string }) => {
	return (
		<div className={classes.listName} style={style}>
			{name}
		</div>
	)
}

const Chevron = () => {
	return <FontAwesomeIcon icon={faChevronDown} className={classes.chevron} />
}

const InactiveButton = ({
	children,
	style,
	onClick,
}: ComponentBase & {
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}) => {
	return (
		<button
			type="button"
			className={classes.btnInactive}
			onClick={(ev) => onClick(ev)}
			style={style}
			aria-label="Open"
		>
			{children}
		</button>
	)
}

const Label = ({
	style,
	label,
}: ComponentBase & {
	label: string
}) => {
	return (
		<h4 className={classes.label} style={style}>
			{label}
		</h4>
	)
}
export const AccountInput = {
	Container,
	InnerLeft,
	InnerRight,
	Input,
	Address,
	SourceIcon,
	Balance,
	ListContainer,
	ListItem,
	ListName,
	Chevron,
	InactiveButton,
	Label,
}
