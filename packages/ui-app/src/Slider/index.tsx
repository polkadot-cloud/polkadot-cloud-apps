// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import RcSlider from 'rc-slider'
import 'rc-slider/assets/index.css'
import classes from './index.module.scss'
import type { SliderProps } from './types'

export const Slider = ({
	value,
	onChange,
	min,
	max,
	step,
	disabled = false,
	ariaLabel,
	formatValue,
}: SliderProps) => (
	<div className={classes.slider} data-disabled={disabled || undefined}>
		<RcSlider
			className={classes.control}
			classNames={{ handle: classes.handle }}
			min={min}
			max={max}
			value={value}
			step={step}
			disabled={disabled}
			ariaLabelForHandle={ariaLabel}
			ariaValueTextFormatterForHandle={formatValue}
			onChange={(nextValue) => {
				if (typeof nextValue === 'number') onChange(nextValue)
			}}
			styles={{
				track: { backgroundColor: 'var(--gray-1000)' },
				rail: { backgroundColor: 'var(--btn-bg-secondary)' },
				handle: {
					backgroundColor: 'var(--bg-primary)',
					borderColor: 'var(--gray-1000)',
					opacity: 1,
				},
			}}
		/>
	</div>
)
