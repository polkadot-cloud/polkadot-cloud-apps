// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from 'ui-app/Card'
import { Badge } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import { AccountPrompt } from './Wrapper'

export const Connect = () => {
	const { t } = useTranslation()
	const { openModal } = useOverlay().modal

	return (
		<CardWrapper className="transparent">
			<AccountPrompt>
				<h3>{t('noAccountSelected', { ns: 'app' })}</h3>
				<Badge.Container hList format="button">
					<Badge.Inner>
						<button
							type="button"
							onClick={() => openModal({ key: 'Accounts' })}
						>
							{t('selectAccount', { ns: 'app' })}
							<FontAwesomeIcon icon={faChevronRight} transform="shrink-4" />
						</button>
					</Badge.Inner>
				</Badge.Container>
			</AccountPrompt>
		</CardWrapper>
	)
}
