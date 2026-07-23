// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { getStakingChainData } from 'consts/util'
import { useInputAutoFontSize } from 'hooks/useInputAutoFontSize'
import { useNetwork } from 'hooks/useNetwork'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
	BalanceInputSetter,
	BalanceInputValue,
} from './types'

const sanitizeValue = (value: string, maxDecimals: number): string => {
	const normalized = value.replace(/[^\d.]/g, '')

	if (!normalized) {
		return ''
	}

	const dotIndex = normalized.indexOf('.')
	if (dotIndex === -1) {
		return normalized
	}

	const integerPart = normalized.slice(0, dotIndex) || '0'
	const decimalPart = normalized
		.slice(dotIndex + 1)
		.replace(/\./g, '')
		.slice(0, maxDecimals)

	if (maxDecimals > 0 && normalized.endsWith('.') && !decimalPart.length) {
		return `${integerPart}.`
	}

	return maxDecimals > 0 ? `${integerPart}.${decimalPart}` : integerPart
}

const BalanceInputControl = ({
	value,
	unit,
	maxAvailable,
	maxDecimals,
	disabled = false,
	syncing = false,
	label,
	ariaLabel,
	displayFor = 'default',
	leading,
	trailing,
	multi = false,
	onChange,
	onBlur,
}: BalanceInputControlProps) => {
	const { t } = useTranslation('app')
	const { inputRef, fontSize: inputFontSize } = useInputAutoFontSize({ value })
	const formattedAvailable = `${maxAvailable.toFormat()} ${unit}`
	const maxDisabled = disabled || syncing || maxAvailable.isLessThanOrEqualTo(0)

	return (
		<div
			className={classNames(classes.wrapper, {
				[classes.canvas]: displayFor === 'canvas',
			})}
		>
			<div className={classes.header}>
				<span className={classes.label}>{label ?? t('amount')}</span>
				<span className={classes.available}>
					{t('available')}:{' '}
					<button
						type="button"
						className={classes.availableButton}
						disabled={maxDisabled}
						onClick={() => {
							onChange(sanitizeValue(maxAvailable.toFixed(), maxDecimals))
						}}
					>
						{syncing ? '...' : formattedAvailable}
					</button>
				</span>
			</div>
			<div
				className={`${classes.inputRow} ${multi ? classes.inputRowMulti : ''}`}
				style={{ opacity: disabled ? 0.5 : 1 }}
			>
				{leading}
				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(event) => {
						onChange(sanitizeValue(event.target.value, maxDecimals))
					}}
					onBlur={() => {
						if (value.endsWith('.')) {
							onChange(value.slice(0, -1))
						}
						onBlur?.()
					}}
					className={classes.amountInput}
					placeholder="0.00"
					inputMode="decimal"
					autoComplete="off"
					aria-label={ariaLabel ?? `${unit} amount`}
					disabled={disabled}
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
	setters = [],
	disabled,
	defaultValue,
	maxAvailable,
	disableTxFeeUpdate = false,
	value = '0',
	syncing = false,
	label,
	ariaLabel,
	displayFor,
}: BalanceInputProps) => {
	const { network } = useNetwork()
	const { activeAddress } = useActiveAccount()
	const { unit, units } = getStakingChainData(network)
	const TokenIcon = getChainIcons(network).token
	const [localValue, setLocalValue] = useState<string>(value)
	const lastEmittedValue = useRef<string | null>(null)

	useEffect(() => {
		lastEmittedValue.current = null
		setLocalValue(defaultValue ?? '0')
	}, [activeAddress, defaultValue])

	useEffect(() => {
		const nextValue = value.toString()
		if (lastEmittedValue.current === nextValue) {
			lastEmittedValue.current = null
			return
		}

		lastEmittedValue.current = null
		if (!disableTxFeeUpdate) {
			setLocalValue(nextValue)
		}
	}, [disableTxFeeUpdate, value])

	const updateValue = (nextValue: string) => {
		setLocalValue(nextValue)

		const normalizedValue = nextValue || '0'
		lastEmittedValue.current = new BigNumber(normalizedValue).toString()
		for (const setter of setters) {
			setter({
				value: new BigNumber(normalizedValue),
				inputValue: nextValue,
			})
		}
	}

	return (
		<BalanceInputControl
			value={localValue}
			unit={unit}
			maxAvailable={new BigNumber(maxAvailable)}
			maxDecimals={units}
			disabled={disabled}
			syncing={syncing}
			label={label}
			ariaLabel={ariaLabel}
			displayFor={displayFor}
			onChange={updateValue}
			leading={<TokenIcon className={classes.tokenIcon} aria-hidden />}
		/>
	)
}

export const BalanceInputMulti = <T extends string>({
	options,
	selected,
	onSelect,
	onChange,
	maxAvailable,
	...inputProps
}: BalanceInputMultiProps<T>) => (
	<BalanceInputControl
		{...inputProps}
		unit={selected.label}
		maxAvailable={new BigNumber(maxAvailable)}
		multi
		onChange={onChange}
		trailing={
			<Dropdown options={options} selected={selected} onSelect={onSelect} />
		}
	/>
)
