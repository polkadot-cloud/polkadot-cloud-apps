// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useId, useLayoutEffect, useRef } from 'react'
import classes from './index.module.scss'
import type { ChatComposerProps } from './types'

export const ChatComposer = ({
	value,
	onChange,
	onSend,
	label,
	placeholder,
	hint,
	sendLabel,
	disabled,
	readOnly,
}: ChatComposerProps) => {
	const id = useId()
	const inputRef = useRef<HTMLTextAreaElement>(null)

	// Grow with the draft, then scroll long messages without pushing history away.
	useLayoutEffect(() => {
		const input = inputRef.current
		if (input) {
			input.style.height = 'auto'
			input.style.height = `${input.scrollHeight}px`
		}
	}, [value])

	return (
		<form
			className={classes.composer}
			onSubmit={(event) => {
				event.preventDefault()
				if (!disabled && value.trim()) {
					onSend()
				}
			}}
		>
			<div className={classes.composerField}>
				<label className={classes.visuallyHidden} htmlFor={id}>
					{label}
				</label>
				<textarea
					ref={inputRef}
					id={id}
					value={value}
					readOnly={readOnly}
					placeholder={placeholder}
					aria-describedby={`${id}-hint`}
					maxLength={8000}
					rows={2}
					onChange={(event) => onChange(event.target.value)}
					onKeyDown={(event) => {
						if (
							event.key === 'Enter' &&
							!event.shiftKey &&
							!event.nativeEvent.isComposing
						) {
							event.preventDefault()
							event.currentTarget.form?.requestSubmit()
						}
					}}
				/>
				<div className={classes.composerActions}>
					<small id={`${id}-hint`}>{hint}</small>
					<button type="submit" disabled={disabled || !value.trim()}>
						{sendLabel}
						<FontAwesomeIcon icon={faArrowUp} />
					</button>
				</div>
			</div>
		</form>
	)
}
