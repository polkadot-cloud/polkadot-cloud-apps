// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { Field } from '../Field'
import type { SendFormFieldProps } from '../Field/types'
import classes from './index.module.scss'

export type SendFormSegmentProps = SendFormFieldProps & {
	layer?: 'default' | 'raised' | 'top'
}

export const Segment = ({
	title,
	children,
	className,
	headerContent,
	layer = 'default',
	responsiveHeader = false,
}: SendFormSegmentProps) => (
	<Field
		title={title}
		headerContent={headerContent}
		responsiveHeader={responsiveHeader}
		className={classNames(classes.segment, className, {
			[classes.raisedLayer]: layer === 'raised',
			[classes.topLayer]: layer === 'top',
		})}
	>
		{children}
	</Field>
)
