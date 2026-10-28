// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { getStakingChainData } from 'consts/util'
import { useInputAutoFontSize } from 'hooks/useInputAutoFontSize'
import { useNetwork } from 'hooks/useNetwork'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { sanitizeBalanceInput } from 'utils'
import { Dropdown } from '../Dropdown'
import classes from './index.module.scss'
import type {
	BalanceInputControlProps,
	BalanceInputMultiProps,
	BalanceInputProps,
} from './types'

export type {
	BalanceInputMultiProps,
	BalanceInputProps,
	BalanceInputValue,
} from './types'

const BalanceInputControl = ({
	value,
	unit,
	maxAvailable,
	allowMax = true,
	maxDecimals,
	disabled = false,
	readOnly = false,
	syncing = false,
	label,
	ariaLabel,
	displayFor = 'default',
	leading,
	trailing,
	onChange,
	onBlur,
}: BalanceInputControlProps) => {
	const { t } = useTranslation('app')
	const { inputRef, fontSize: inputFontSize } = useInputAutoFontSize({ value })
	const formattedAvailable = `${maxAvailable.toFormat()} ${unit}`
	const maxDisabled = disabled || syncing || maxAvailable.isLessThanOrEqualTo(0)
	const updateValue = (nextValue: string) => {
		if (readOnly) return
		const sanitized = sanitizeBalanceInput(nextValue, maxDecimals)
		if (sanitized !== null && sanitized !== value) {
			onChange?.(sanitized)
		}
	}

	useEffect(() => {
		if (readOnly) return
		const sanitized = sanitizeBalanceInput(value, maxDecimals)
		if (sanitized !== null && sanitized !== value) {
			onChange?.(sanitized)
		}
	}, [maxDecimals, onChange, readOnly, value])

	return (
		<div
			className={classNames(classes.wrapper, {
				[classes.canvas]: displayFor === 'canvas',
				[classes.modal]: displayFor === 'modal',
			})}
		>
			<div className={classes.header}>
				<span className={classes.label}>{label ?? t('amount')}</span>
				<span className={classes.available}>
					{t('available')}:{' '}
					{readOnly || !allowMax ? (
						<span className={classes.availableValue}>
							{syncing ? '...' : formattedAvailable}
						</span>
					) : (
						<button
							type="button"
							className={classes.availableButton}
							disabled={maxDisabled}
							onClick={() => updateValue(maxAvailable.toFixed())}
						>
							{syncing ? '...' : formattedAvailable}
						</button>
					)}
				</span>
			</div>
			<div
				className={classNames(classes.inputRow, {
					[classes.inputRowMulti]: trailing,
				})}
				style={{ opacity: disabled && !readOnly ? 0.5 : 1 }}
			>
				{leading}
				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(event) => updateValue(event.target.value)}
					onBlur={() => {
						if (!readOnly && value.endsWith('.')) {
							onChange?.(value.slice(0, -1))
						}
						onBlur?.()
					}}
					className={classes.amountInput}
					placeholder="0.00"
					inputMode="decimal"
					autoComplete="off"
					aria-label={ariaLabel ?? `${unit} ${t('amount')}`}
					aria-live={readOnly ? 'polite' : undefined}
					disabled={disabled}
					readOnly={readOnly}
					style={
						inputFontSize !== undefined
							? { fontSize: `${inputFontSize}px` }
							: undefined
					}
				/>
				{trailing}
			</div>
		</div>
	)
}

export const BalanceInput = ({
	maxAvailable,
	...inputProps
}: BalanceInputProps) => {
	const { network } = useNetwork()
	const { unit, units } = getStakingChainData(network)
	const TokenIcon = getChainIcons(network).token

	return (
		<BalanceInputControl
			{...inputProps}
			unit={unit}
			maxAvailable={new BigNumber(maxAvailable)}
			maxDecimals={units}
			leading={<TokenIcon className={classes.tokenIcon} aria-hidden />}
		/>
	)
}

export const BalanceInputMulti = <T extends string>({
	options,
	selected,
	onSelect,
	maxAvailable,
	...inputProps
}: BalanceInputMultiProps<T>) => (
	<BalanceInputControl
		{...inputProps}
		unit={selected.label}
		maxAvailable={new BigNumber(maxAvailable)}
		trailing={
			<Dropdown options={options} selected={selected} onSelect={onSelect} />
		}
	/>
)
