// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTheme } from 'hooks/useTheme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChatPanel } from 'ui-app/Chat'
import type { GuidanceGoal } from '../types'
import { useChat } from '../useChat'
import { Composer } from './Composer'
import { Goals } from './Goals'
import { Messages } from './Messages'
import type { ChatProps } from './types'
import { Welcome } from './Welcome'

export const Conversation = ({ endpoint, currentNominations }: ChatProps) => {
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
		editRejected,
		loadOlder,
	} = useChat(endpoint)
	const [goals, setGoals] = useState<GuidanceGoal[]>([])
	const [shareNominations, setShareNominations] = useState(true)
	const pendingIntake = state.pending?.intake
	const chosenGoals = pendingIntake?.goals ?? goals
	const submit = () =>
		send(
			state.intakeRequired
				? {
						goals: chosenGoals,
						...(shareNominations && currentNominations !== undefined
							? { currentNominations }
							: {}),
					}
				: undefined,
		)
	const newChat = () => {
		setGoals([])
		setShareNominations(true)
		startNew()
	}
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
						onSend={submit}
						onEdit={() => {
							if (pendingIntake) setGoals(pendingIntake.goals)
							editRejected()
						}}
						ready={
							state.initialized &&
							state.intakeRequired !== null &&
							(!state.intakeRequired || chosenGoals.length > 0)
						}
					/>
				) : undefined
			}
		>
			{!started || expired ? (
				<Welcome expired={expired} onStart={expired ? newChat : start} />
			) : (
				<Messages
					state={state}
					onLoadOlder={loadOlder}
					prompt={
						state.intakeRequired ? (
							<Goals
								goals={chosenGoals}
								onChange={setGoals}
								currentNominations={
									pendingIntake
										? pendingIntake.currentNominations
										: currentNominations
								}
								shareNominations={
									pendingIntake
										? pendingIntake.currentNominations !== undefined
										: shareNominations
								}
								onShareChange={setShareNominations}
								disabled={state.sending || Boolean(pendingIntake)}
							/>
						) : undefined
					}
				/>
			)}
		</ChatPanel>
	)
}
