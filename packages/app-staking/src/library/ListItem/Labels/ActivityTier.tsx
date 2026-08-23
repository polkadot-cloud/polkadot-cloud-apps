// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorActivityTier } from 'contexts/Validators/types'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useTheme } from 'hooks/useTheme'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'ui-core/base'
import { Label } from 'ui-core/list'

const getActivityTierColor = (activityTier?: ValidatorActivityTier) =>
	activityTier === 'belowBaseline'
		? 'var(--status-warning)'
		: activityTier === 'notRated'
			? 'var(--text-tertiary)'
			: undefined

const valueStyle: CSSProperties = {
	display: 'block',
	maxWidth: '100%',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	width: '100%',
}

export const ActivityTier = ({
	address,
	activityTier: activityTierOverride,
	detailed = false,
}: {
	address: string
	activityTier?: ValidatorActivityTier | null
	detailed?: boolean
}) => {
	const { t } = useTranslation('app')
	const { themeElementRef } = useTheme()
	const { getValidatorActivityTier } = useValidators()
	const activityTier =
		activityTierOverride === undefined
			? getValidatorActivityTier(address)
			: (activityTierOverride ?? undefined)
	const label = activityTier ? t(activityTier) : detailed ? '—' : ''
	const color = getActivityTierColor(activityTier)

	if (!detailed) {
		return <Label style={{ color }}>{label}</Label>
	}

	const style = {
		...valueStyle,
		color,
	}

	if (activityTier !== 'belowBaseline') {
		return <span style={style}>{label}</span>
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
					...style,
					appearance: 'none',
					background: 'transparent',
					border: 0,
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
