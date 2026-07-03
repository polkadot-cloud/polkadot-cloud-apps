// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonSubmitWithFee } from 'ui-buttons'
import type { SubmitButtonProps } from '../types'

export const SubmitButton = ({
	text,
	icon,
	onSubmit,
	disabled,
	pulse,
	iconTransform = 'grow-2',
	fee,
}: SubmitButtonProps) => {
	return (
		<ButtonSubmitWithFee
			disabled={disabled}
			onSubmit={() => onSubmit()}
			submitText={text}
			icon={icon}
			iconTransform={iconTransform}
			pulse={pulse}
			fee={fee}
		/>
	)
}
