// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './index.module.scss'

export const defaultSlippageBps = 50

export const SlippageControl = ({
	value,
	onChange,
	disabled,
}: {
	value: number
	onChange: (value: number) => void
	disabled: boolean
}) => {
	const { t } = useTranslation('swap')
	const id = useId()
	const [expanded, setExpanded] = useState(false)
	return (
		<div className={classes.slippage}>
			<button
				type="button"
				className={classes.slippageToggle}
				aria-expanded={expanded}
				aria-controls={`${id}-panel`}
				onClick={() => setExpanded(!expanded)}
			>
				{t('slippageSettings')}
				<FontAwesomeIcon icon={faChevronDown} />
			</button>
			<div
				id={`${id}-panel`}
				className={classes.slippagePanel}
				hidden={!expanded}
			>
				<input
					id={`${id}-slider`}
					className={classes.slippageSlider}
					type="range"
					min={10}
					max={500}
					step={10}
					value={value}
					disabled={disabled}
					aria-label={t('slippage')}
					aria-valuetext={`${value / 100}%`}
					onChange={(event) => onChange(Number(event.target.value))}
				/>
				<output className={classes.slippageValue} htmlFor={`${id}-slider`}>
					{value / 100}%
				</output>
				<button
					type="button"
					className={classes.slippageReset}
					aria-label={t('resetSlippage', { value: defaultSlippageBps / 100 })}
					disabled={disabled || value === defaultSlippageBps}
					onClick={() => onChange(defaultSlippageBps)}
				>
					{t('reset', { ns: 'app' })}
				</button>
			</div>
		</div>
	)
}
