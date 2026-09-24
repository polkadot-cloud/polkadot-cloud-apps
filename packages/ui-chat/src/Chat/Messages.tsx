// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { ChatMessages, ChatNotice } from 'ui-app/Chat'
import type { MessagesProps } from './types'

export const Messages = ({ state, onLoadOlder }: MessagesProps) => {
	const { t } = useTranslation('chat')
	const error =
		state.error &&
		{
			connection: t('connectionError'),
			history: t('historyError'),
			send: t('sendError'),
			rateLimit: t('rateLimit'),
		}[state.error]
	const authors = {
		CLIENT: t('you'),
		STAFF: t('team'),
		SYSTEM: t('update'),
	}

	return (
		<>
			{error && (
				<ChatNotice
					tone={
						state.error === 'connection' || state.error === 'rateLimit'
							? 'warning'
							: 'danger'
					}
				>
					{error}
				</ChatNotice>
			)}
			{!state.persistent && (
				<ChatNotice tone="warning">{t('temporary')}</ChatNotice>
			)}
			<ChatMessages
				messages={state.messages.map((message) => ({
					...message,
					mine: message.authorType === 'CLIENT',
					author: authors[message.authorType],
				}))}
				label={t('history')}
				olderLabel={state.loadingOlder ? t('loading') : t('older')}
				latestLabel={t('latest')}
				hasOlder={Boolean(state.nextCursor)}
				loadingOlder={state.loadingOlder || state.status !== 'live'}
				onLoadOlder={onLoadOlder}
				loading={!state.initialized && state.status !== 'reconnecting'}
				empty={
					<p>
						{state.initialized
							? t('empty')
							: state.status === 'reconnecting'
								? t('reconnecting')
								: t('loading')}
					</p>
				}
			/>
		</>
	)
}
