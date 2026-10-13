// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { TokenInputProps } from '../types'
import classes from './index.module.scss'

export const TokenInput = ({
	onChange,
	placeholder,
	value,
	marginY,
	id,
	label,
}: TokenInputProps) => {
	const allClasses = classNames(classes.tokenInput, {
		[classes.marginY]: !!marginY,
	})

	return (
		<div className={allClasses}>
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				value={value}
				onChange={(e) => onChange(e)}
				placeholder={placeholder}
			/>
		</div>
	)
}
