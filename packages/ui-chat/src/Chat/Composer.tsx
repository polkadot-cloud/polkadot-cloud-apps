// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { ChatComposer, ChatNotice } from 'ui-app/Chat'
import { ButtonMono } from 'ui-buttons'
import type { ComposerProps } from './types'

export const Composer = ({
	state: { pending, sending, status, rejected },
	draft,
	onChange,
	onSend,
	onEdit,
	ready = true,
}: ComposerProps) => {
	const { t } = useTranslation('chat')
	const sendLabel = sending ? t('sending') : pending ? t('retry') : t('send')

	return (
		<>
			{rejected && (
				<ChatNotice tone="warning">
					<ButtonMono text={t('editMessage')} onClick={onEdit} />
				</ChatNotice>
			)}
			<ChatComposer
				value={pending?.body ?? draft}
				onChange={onChange}
				onSend={onSend}
				label={t('message')}
				placeholder={t('placeholder')}
				hint={t('enterHint')}
				sendLabel={sendLabel}
				disabled={status !== 'live' || sending || !ready || rejected}
				readOnly={Boolean(pending)}
			/>
		</>
	)
}
