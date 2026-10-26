// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DefaultSwapSlippageBps } from 'consts/swap'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Slider } from 'ui-app/Slider'
import classes from './SlippageControl.module.scss'

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
				<Slider
					min={10}
					max={500}
					step={10}
					value={value}
					disabled={disabled}
					ariaLabel={t('slippage')}
					formatValue={(value) => `${value / 100}%`}
					onChange={onChange}
				/>
				<output className={classes.slippageValue}>{value / 100}%</output>
				<button
					type="button"
					className={classes.slippageReset}
					aria-label={t('resetSlippage', {
						value: DefaultSwapSlippageBps / 100,
					})}
					disabled={disabled || value === DefaultSwapSlippageBps}
					onClick={() => onChange(DefaultSwapSlippageBps)}
				>
					{t('reset', { ns: 'app' })}
				</button>
			</div>
		</div>
	)
}
