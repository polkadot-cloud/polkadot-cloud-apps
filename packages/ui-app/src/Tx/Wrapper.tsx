// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HTMLAttributes } from 'react'
import classes from './index.module.scss'

export const txClasses = classes

const cx = (...classNames: (string | undefined)[]) =>
	classNames.filter(Boolean).join(' ')

const resolveClassName = (className?: string) =>
	className
		?.split(/\s+/)
		.filter(Boolean)
		.map((name) => classes[name] || name)
		.join(' ')

export const Wrapper = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className={cx(classes.wrapper, resolveClassName(className))}
	/>
)

export const SubmitButtonWrapper = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className={cx(classes.submitButtonWrapper, resolveClassName(className))}
	/>
)

export const PromptWrapper = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className={cx(classes.promptWrapper, resolveClassName(className))}
	/>
)

export const SignerWrapper = ({
	className,
	...props
}: HTMLAttributes<HTMLParagraphElement>) => (
	<p
		{...props}
		className={cx(classes.signerWrapper, resolveClassName(className))}
	/>
)

export const ProxySwitcher = ({
	className,
	...props
}: HTMLAttributes<HTMLSpanElement>) => (
	<span
		{...props}
		className={cx(classes.proxySwitcher, resolveClassName(className))}
	/>
)
