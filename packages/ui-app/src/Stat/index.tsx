// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { useFitText } from 'hooks/useFitText'
import type { CSSProperties, ReactNode } from 'react'
import { Loader } from 'ui-core/base'
import classes from './index.module.scss'

interface BaseProps {
	children?: ReactNode
	style?: CSSProperties
}

interface TextProps extends BaseProps {
	text: string
	primary?: boolean
}

const FitText = ({
	text,
	children,
}: Required<Pick<BaseProps, 'children'>> & {
	text: string
}) => {
	const ref = useFitText<HTMLSpanElement>(text)

	return (
		<span className={classes.fitText} ref={ref}>
			<span className={classes.fitContent}>{children}</span>
		</span>
	)
}

const Row = ({ children, style }: BaseProps) => (
	<div className={classNames('pagePadding', classes.row)} style={style}>
		{children}
	</div>
)

const Card = ({ children, style }: BaseProps) => (
	<div className={classes.card} style={style}>
		<div className={classes.surface}>{children}</div>
	</div>
)

const Button = ({
	children,
	style,
	onClick,
}: BaseProps & { onClick: () => void }) => (
	<div className={classNames(classes.card, classes.button)} style={style}>
		<button className={classes.surface} type="button" onClick={onClick}>
			{children}
		</button>
	</div>
)

const Content = ({ children, style }: BaseProps) => (
	<div className={classes.content} style={style}>
		{children}
	</div>
)

const Graphic = ({ children, style }: BaseProps) => (
	<div className={classes.graphic} style={style}>
		{children}
	</div>
)

const Title = ({
	children,
	style,
	text,
	primary,
	semibold,
}: TextProps & { semibold?: boolean }) => (
	<h3
		className={classNames(classes.title, {
			[classes.primary]: primary,
			[classes.semibold]: semibold,
		})}
		style={style}
	>
		<FitText text={text}>{children ?? text}</FitText>
	</h3>
)

const Subtitle = ({ children, style, text, primary }: TextProps) => (
	<h4
		className={classNames(classes.subtitle, {
			[classes.primary]: primary,
		})}
		style={style}
	>
		<FitText text={text}>{text}</FitText>
		{children}
	</h4>
)

const Total = ({ children, style }: BaseProps) => (
	<span className={classes.total} style={style}>
		{children}
	</span>
)

const Tooltip = ({ children }: BaseProps) => (
	<div className={classes.tooltip}>
		<h3>{children}</h3>
	</div>
)

const Loading = () => (
	<Card>
		<Content>
			<Loader className={classes.loadingValue} />
			<Loader className={classes.loadingLabel} />
		</Content>
	</Card>
)

export const Stat = {
	Button,
	Card,
	Content,
	Graphic,
	Loading,
	Row,
	Subtitle,
	Title,
	Tooltip,
	Total,
}
