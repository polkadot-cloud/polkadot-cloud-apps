// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronRight,
	faCoins,
	faUserLargeSlash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { CardWrapper } from 'ui-app/Card'
import { Badge } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'

const AccountPrompt = styled.section`
	align-items: center;
	display: flex;
	flex-flow: column nowrap;
	gap: 0.6rem;
	justify-content: center;
	margin-top: 1.4rem;
	min-height: 13rem;
	padding: 2rem 1rem;
	text-align: center;

	h3 {
		font-size: 1.5rem;
		line-height: 1.25;
		margin: 0;
	}

	p {
		color: var(--text-tertiary);
		font-size: 1.2rem;
		line-height: 1.45;
		margin: -0.2rem 0 0.2rem;
	}
`

const AccountPromptGraphic = styled.div<{
	$status: 'disconnected' | 'notStaking'
}>`
	--prompt-accent: ${({ $status }) =>
		$status === 'notStaking' ? 'var(--status-warning)' : 'var(--accent-800)'};

	align-items: center;
	background: var(--gray-300);
	border: 1px solid var(--gray-500);
	border-radius: 50%;
	color: var(--gray-900);
	display: flex;
	font-size: 2.25rem;
	height: 5.5rem;
	justify-content: center;
	margin-bottom: 0.65rem;
	position: relative;
	width: 5.5rem;

	&::after {
		background: var(--prompt-accent);
		border: 0.25rem solid var(--bg-body);
		border-radius: 50%;
		bottom: 0.1rem;
		content: '';
		height: 1rem;
		position: absolute;
		right: 0.1rem;
		width: 1rem;
	}
`

export const Connect = ({
	status = 'disconnected',
}: {
	status?: 'disconnected' | 'notStaking'
}) => {
	const { t } = useTranslation('app')
	const { openModal } = useOverlay().modal
	const notStaking = status === 'notStaking'

	return (
		<CardWrapper className="transparent">
			<AccountPrompt>
				<AccountPromptGraphic $status={status}>
					<FontAwesomeIcon icon={notStaking ? faCoins : faUserLargeSlash} />
				</AccountPromptGraphic>
				<h3>
					{notStaking ? t('notNominatingOrPoolOwner') : t('noAccountSelected')}
				</h3>
				{notStaking && <p>{t('selectNominatingOrPoolOwner')}</p>}
				<Badge.Container format="button">
					<Badge.Inner>
						<button
							type="button"
							onClick={() => openModal({ key: 'Accounts' })}
						>
							{t('selectAccount')}
							<FontAwesomeIcon icon={faChevronRight} transform="shrink-4" />
						</button>
					</Badge.Inner>
				</Badge.Container>
			</AccountPrompt>
		</CardWrapper>
	)
}
