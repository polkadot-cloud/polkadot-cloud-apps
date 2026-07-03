// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faHashtag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTooltip } from 'hooks/useTooltip'
import { useTranslation } from 'react-i18next'
import { TooltipArea } from 'ui-core/base'
import { Label } from 'ui-core/list'

export const PoolId = ({ id }: { id: number }) => {
	const { t } = useTranslation('app')
	const { setTooltipTextAndOpen } = useTooltip()

	const tooltipText = t('poolId')

	return (
		<Label>
			<TooltipArea
				text={tooltipText}
				onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
			/>
			<FontAwesomeIcon icon={faHashtag} />
			&nbsp;{id}
		</Label>
	)
}
