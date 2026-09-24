// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classes from './index.module.scss'
import type { ChatChecklistProps } from './types'

export const ChatChecklist = ({
	legend,
	options,
	onChange,
	disabled,
}: ChatChecklistProps) => (
	<fieldset className={classes.checklist} disabled={disabled}>
		<legend>{legend}</legend>
		{options.map(({ value, label, checked }) => (
			<label key={value} data-checked={checked}>
				<input
					type="checkbox"
					checked={checked}
					onChange={(event) => onChange(value, event.target.checked)}
				/>
				<span>{label}</span>
			</label>
		))}
	</fieldset>
)
