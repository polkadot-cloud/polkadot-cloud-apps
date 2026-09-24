// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { ChatComposer } from 'ui-app/Chat'
import type { ComposerProps } from './types'

export const Composer = ({
	state: { pending, sending, status },
	draft,
	onChange,
	onSend,
}: ComposerProps) => {
	const { t } = useTranslation('chat')
	const sendLabel = sending ? t('sending') : pending ? t('retry') : t('send')

	return (
		<ChatComposer
			value={pending?.body ?? draft}
			onChange={onChange}
			onSend={onSend}
			label={t('message')}
			placeholder={t('placeholder')}
			hint={t('enterHint')}
			sendLabel={sendLabel}
			disabled={status !== 'live' || sending}
			readOnly={Boolean(pending)}
		/>
	)
}
