// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type {
	ButtonHTMLAttributes,
	HTMLAttributes,
	PropsWithChildren,
} from 'react'
import classes from './index.module.scss'

export type PromptSize = 'sm' | 'lg'

type DivProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>

export const PromptWrapper = ({ className, ...props }: DivProps) => (
	<div className={classNames(classes.promptWrapper, className)} {...props} />
)

export const PromptInner = ({ className, ...props }: DivProps) => (
	<div className={classNames(classes.inner, className)} {...props} />
)

export const HeightWrapper = ({
	className,
	size,
	...props
}: DivProps & { size: PromptSize }) => (
	<div
		className={classNames(
			classes.heightWrapper,
			size === 'sm' ? classes.heightWrapperSmall : classes.heightWrapperLarge,
			className,
		)}
		{...props}
	/>
)

export const ContentWrapper = ({ className, ...props }: DivProps) => (
	<div className={classNames(classes.contentWrapper, className)} {...props} />
)

export const PromptBackdropButton = ({
	className,
	type = 'button',
	...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
	<button
		type={type}
		className={classNames(classes.backdropButton, className)}
		{...props}
	/>
)
