// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { FunctionComponent, ReactNode, SVGProps } from 'react'
import { Close } from '../../modal/Close'
import classes from './index.module.scss'

export interface PromptTitleProps {
	title: string
	icon?: IconProp
	Svg?: FunctionComponent<SVGProps<SVGElement>>
	help?: ReactNode
	hideDone?: boolean
	onClose?: () => void
}

export const Title = ({
	title,
	icon,
	Svg,
	help,
	hideDone,
	onClose,
}: PromptTitleProps) => {
	const graphic = Svg ? (
		<Svg style={{ width: '1.5rem', height: '1.5rem' }} />
	) : icon ? (
		<FontAwesomeIcon transform="grow-3" icon={icon} />
	) : null

	return (
		<div className={classes.titleWrapper}>
			<div>
				{graphic}
				<h2>
					{title}
					{help}
				</h2>
			</div>
			{!hideDone && onClose ? (
				<div>
					<Close onClose={onClose} />
				</div>
			) : null}
		</div>
	)
}
