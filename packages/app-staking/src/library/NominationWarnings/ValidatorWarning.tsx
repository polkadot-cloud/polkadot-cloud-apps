// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from 'ui-buttons'
import { StatusCard } from 'ui-core/base'
import classes from './index.module.scss'

export const ValidatorWarning = ({
	children,
	onFix,
	readMoreUrl,
	severity = 'danger',
}: {
	children: ReactNode
	onFix?: () => void
	readMoreUrl?: string
	severity?: 'danger' | 'warning'
}) => {
	const { t } = useTranslation('app')

	return (
		<StatusCard
			action={
				onFix ? (
					<ButtonPrimary
						className={classes.fixButton}
						onClick={onFix}
						text={t('fixIssues')}
					/>
				) : undefined
			}
			icon={severity === 'danger' ? faCircleExclamation : undefined}
			iconFrame={severity !== 'danger'}
			status={severity}
			role="status"
		>
			{children}
			{readMoreUrl && (
				<>
					{' '}
					<a
						className={classes.readMore}
						href={readMoreUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						{t('readMore')}
					</a>
				</>
			)}
		</StatusCard>
	)
}
