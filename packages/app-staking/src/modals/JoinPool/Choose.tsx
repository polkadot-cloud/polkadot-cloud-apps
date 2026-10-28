// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'hooks/useTheme'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'ui-core/base'
import { ModalActionWrapper } from './Wrappers'

export const Choose = ({ onClick }: { onClick: () => void }) => {
	const { t } = useTranslation()
	const { themeElementRef } = useTheme()
	const text = t('chooseAnotherPool', { ns: 'app' })

	return (
		<ModalActionWrapper>
			<Tooltip
				text={text}
				side="bottom"
				container={themeElementRef.current || undefined}
			>
				<button type="button" aria-label={text} onClick={onClick}>
					<FontAwesomeIcon icon={faArrowsRotate} />
				</button>
			</Tooltip>
		</ModalActionWrapper>
	)
}
