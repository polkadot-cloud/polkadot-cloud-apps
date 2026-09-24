// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTheme } from 'hooks/useTheme'
import { useTranslation } from 'react-i18next'
import { ChatPanel } from 'ui-app/Chat'
import { useChat } from '../useChat'
import { Composer } from './Composer'
import { Messages } from './Messages'
import type { ChatProps } from './types'
import { Welcome } from './Welcome'

export const Conversation = ({ endpoint }: ChatProps) => {
	const { t } = useTranslation('chat')
	const { themeElementRef } = useTheme()
	const {
		state,
		open,
		started,
		draft,
		setDraft,
		setOpen,
		start,
		startNew,
		send,
		loadOlder,
	} = useChat(endpoint)
	const expired = state.status === 'expired'
	const status = {
		idle: { label: t('guest'), tone: 'neutral' },
		connecting: { label: t('connecting'), tone: 'neutral' },
		live: { label: t('live'), tone: 'success' },
		reconnecting: { label: t('reconnecting'), tone: 'warning' },
		expired: { label: t('expiredStatus'), tone: 'warning' },
	} as const

	return (
		<ChatPanel
			open={open}
			onOpenChange={setOpen}
			portalContainer={themeElementRef.current || undefined}
			triggerLabel={t('open')}
			closeLabel={t('close')}
			title={t('title')}
			description={t('description')}
			status={status[state.status].label}
			statusTone={status[state.status].tone}
			footer={
				started && !expired ? (
					<Composer
						state={state}
						draft={draft}
						onChange={setDraft}
						onSend={send}
					/>
				) : undefined
			}
		>
			{!started || expired ? (
				<Welcome expired={expired} onStart={expired ? startNew : start} />
			) : (
				<Messages state={state} onLoadOlder={loadOlder} />
			)}
		</ChatPanel>
	)
}
