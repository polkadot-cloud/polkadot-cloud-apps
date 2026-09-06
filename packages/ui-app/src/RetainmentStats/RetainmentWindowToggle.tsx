// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { useTheme } from 'hooks/useTheme'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'ui-core/base'
import classes from './index.module.scss'
import type { RetainmentWindow } from './useRetainmentWindow'

interface RetainmentWindowToggleProps {
	alignEnd?: boolean
	disabled?: boolean
	onChange: (window: RetainmentWindow) => void
	value: RetainmentWindow
}

export const RetainmentWindowToggle = ({
	alignEnd = false,
	disabled = false,
	onChange,
	value,
}: RetainmentWindowToggleProps) => {
	const { t } = useTranslation('app')
	const { themeElementRef } = useTheme()

	return (
		// biome-ignore lint/a11y/useSemanticElements: The control is also rendered inside inline metric labels and row headers.
		<span
			aria-label={t('retainmentStats')}
			className={classNames(classes.windowToggle, alignEnd && classes.alignEnd)}
			role="group"
		>
			{(['oneMonth', 'threeMonths'] as const).map((window) => {
				const months = window === 'oneMonth' ? 1 : 3
				const label = t('monthRetainment', { count: months })

				return (
					<Tooltip
						container={themeElementRef.current || undefined}
						key={window}
						side="top"
						text={t(
							window === 'oneMonth'
								? 'retainmentWindowOneMonth'
								: 'retainmentWindowThreeMonths',
						)}
					>
						<button
							aria-label={label}
							aria-pressed={value === window}
							disabled={disabled}
							onClick={() => onChange(window)}
							type="button"
						>
							{months}m
						</button>
					</Tooltip>
				)
			})}
		</span>
	)
}
