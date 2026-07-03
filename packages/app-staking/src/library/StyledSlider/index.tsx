// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import Slider from 'rc-slider'
import type { StyledSliderProps } from './types'
import { Wrapper } from './Wrapper'

export const StyledSlider = ({
	value,
	step,
	onChange,
	min,
	max,
	className,
}: StyledSliderProps) => (
	<Wrapper className={className}>
		<Slider
			min={min}
			max={max}
			value={value}
			step={step}
			onChange={(val) => onChange(val)}
			activeDotStyle={{
				backgroundColor: 'var(--bg-primary)',
			}}
			styles={{
				track: {
					backgroundColor: 'var(--gray-1000)',
				},
				rail: {
					backgroundColor: 'var(--btn-bg-secondary)',
				},
				handle: {
					backgroundColor: 'var(--bg-primary)',
					borderColor: 'var(--gray-1000)',
					opacity: 1,
				},
			}}
		/>
	</Wrapper>
)
