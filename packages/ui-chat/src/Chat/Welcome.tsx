// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { ChatWelcome } from 'ui-app/Chat'
import { ButtonMono } from 'ui-buttons'
import type { WelcomeProps } from './types'

export const Welcome = ({ expired, onStart }: WelcomeProps) => {
	const { t } = useTranslation('chat')

	return (
		<ChatWelcome>
			<h3>{expired ? t('expiredStatus') : t('welcome')}</h3>
			<p>{expired ? t('expired') : t('guestDescription')}</p>
			<ButtonMono
				lg
				text={expired ? t('startNew') : t('start')}
				onClick={onStart}
			/>
		</ChatWelcome>
	)
}
