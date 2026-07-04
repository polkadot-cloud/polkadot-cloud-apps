// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

export const ButtonCopy = ({
	value,
	size = '1rem',
}: {
	value: string
	size?: string
}) => {
	const [copied, setCopied] = useState(false)

	return (
		<button
			type="button"
			aria-label="Copy"
			style={{ color: 'var(--text-tertiary)', fontSize: size }}
			onClick={async () => {
				await navigator.clipboard?.writeText(value)
				setCopied(true)
				window.setTimeout(() => setCopied(false), 1200)
			}}
		>
			<FontAwesomeIcon icon={copied ? faCheck : faCopy} />
		</button>
	)
}
