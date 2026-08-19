// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronRight,
	faCoins,
	faServer,
	faUserLargeSlash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from 'ui-app/Card'
import { Badge } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import type { ConnectProps } from './types'
import { AccountPrompt, AccountPromptGraphic } from './Wrappers'

export const Connect = ({ status = 'disconnected' }: ConnectProps) => {
	const { t } = useTranslation('app')
	const { openModal } = useOverlay().modal
	const notStaking = status === 'notStaking'
	const validator = status === 'validator'
	const icon = validator ? faServer : notStaking ? faCoins : faUserLargeSlash
	const title = validator
		? t('youAreValidator')
		: notStaking
			? t('notNominatingOrPoolOwner')
			: t('noAccountSelected')
	const subtitle = validator
		? t('nominatingWouldRemoveValidatorRole')
		: notStaking
			? t('selectNominatingOrPoolOwner')
			: null
	const accountButtonLabel =
		status === 'disconnected' ? t('selectAccount') : t('selectAnotherAccount')

	return (
		<CardWrapper className="transparent">
			<AccountPrompt>
				<AccountPromptGraphic>
					<FontAwesomeIcon icon={icon} />
				</AccountPromptGraphic>
				<h3>{title}</h3>
				{subtitle && <p>{subtitle}</p>}
				<Badge.Container format="button">
					<Badge.Inner>
						<button
							type="button"
							onClick={() => openModal({ key: 'Accounts' })}
						>
							{accountButtonLabel}
							<FontAwesomeIcon icon={faChevronRight} transform="shrink-4" />
						</button>
					</Badge.Inner>
				</Badge.Container>
			</AccountPrompt>
		</CardWrapper>
	)
}
