// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronRight,
	faCoins,
	faUserLargeSlash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from 'ui-app/Card'
import { Badge } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import {
	AccountPrompt,
	AccountPromptAction,
	AccountPromptGraphic,
} from './Wrapper'

export const Connect = ({
	status = 'disconnected',
}: {
	status?: 'disconnected' | 'notStaking'
}) => {
	const { t } = useTranslation()
	const { openModal } = useOverlay().modal
	const notStaking = status === 'notStaking'

	return (
		<CardWrapper className="transparent">
			<AccountPrompt>
				<AccountPromptGraphic $status={status}>
					<FontAwesomeIcon icon={notStaking ? faCoins : faUserLargeSlash} />
				</AccountPromptGraphic>
				<h3>
					{notStaking
						? 'Not Nominating or a Pool Owner'
						: t('noAccountSelected', { ns: 'app' })}
				</h3>
				{notStaking && (
					<p>
						Select an account that is nominating or owns a pool to manage
						nominations.
					</p>
				)}
				<AccountPromptAction>
					<Badge.Container format="button">
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
				</AccountPromptAction>
			</AccountPrompt>
		</CardWrapper>
	)
}
