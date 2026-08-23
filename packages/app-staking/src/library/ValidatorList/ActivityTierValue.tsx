// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTheme } from 'hooks/useTheme'
import type { CSSProperties } from 'react'
import { Tooltip } from 'ui-core/base'

const valueStyle: CSSProperties = {
	display: 'block',
	maxWidth: '100%',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	width: '100%',
}

export const ActivityTierValue = ({
	label,
	showTooltip,
}: {
	label: string
	showTooltip: boolean
}) => {
	const { themeElementRef } = useTheme()

	if (!showTooltip) {
		return <span style={valueStyle}>{label}</span>
	}

	return (
		<Tooltip
			align="start"
			container={themeElementRef.current || undefined}
			side="top"
			text={label}
		>
			<button
				type="button"
				style={{
					...valueStyle,
					appearance: 'none',
					background: 'transparent',
					border: 0,
					color: 'inherit',
					cursor: 'default',
					font: 'inherit',
					margin: 0,
					padding: 0,
					textAlign: 'start',
				}}
			>
				{label}
			</button>
		</Tooltip>
	)
}
