// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCircleExclamation,
	faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ValidatorItemWarning } from 'library/GenerateNominations/utils'
import { useTranslation } from 'react-i18next'
import classes from './ValidatorWarnings.module.scss'

export const ValidatorWarnings = ({
	warnings,
	format,
}: {
	warnings: ValidatorItemWarning[]
	format: 'row' | 'col'
}) => {
	const { t } = useTranslation('app')
	if (warnings.length === 0) {
		return null
	}

	return (
		<ul
			className={classes.warnings}
			data-format={format}
			aria-label={t('nominationHealthCheckNeedsAttention')}
		>
			{warnings.map(({ type, labelKey, severity }) => (
				<li key={type} data-severity={severity}>
					<FontAwesomeIcon
						icon={severity === 'danger' ? faCircleXmark : faCircleExclamation}
					/>
					{t(labelKey)}
				</li>
			))}
		</ul>
	)
}
