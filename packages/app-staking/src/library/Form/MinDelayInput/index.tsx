// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import type { MinDelayProps } from './types'
import { MinDelayInputWrapper } from './Wrapper'

export const MinDelayInput = ({
	initial,
	field,
	label,
	handleChange,
}: MinDelayProps) => {
	const [current, setCurrent] = useState<number>(initial)

	useEffect(() => {
		setCurrent(initial)
	}, [initial])

	const onChange = (value: string) => {
		if (!new BigNumber(value).isNaN() || value === '') {
			const newValue = new BigNumber(value || 0).toNumber()
			setCurrent(newValue)
			handleChange(field, newValue)
		}
	}

	const onIncrement = () => {
		const newValue = current + 1
		onChange(String(newValue))
	}

	const onDecrement = () => {
		const newValue = Math.max(current - 1, 0)
		onChange(String(newValue))
	}

	return (
		<MinDelayInputWrapper>
			<div className="input">
				<input
					type="text"
					placeholder="0"
					value={current}
					onChange={({ target: { value } }) => onChange(value)}
				/>
				{label}
			</div>
			<div className="toggle">
				<button type="button" onClick={() => onIncrement()}>
					<FontAwesomeIcon icon={faCaretUp} transform="shrink-5" />
				</button>
				<button type="button" onClick={() => onDecrement()}>
					<FontAwesomeIcon icon={faCaretDown} transform="shrink-5" />
				</button>
			</div>
		</MinDelayInputWrapper>
	)
}
