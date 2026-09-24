// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { usePlugins } from 'hooks/usePlugins'
import { useTranslation } from 'react-i18next'
import { Conversation } from './Conversation'
import type { ChatProps } from './types'

// Unmount the client when chat becomes unavailable so connections and requests stop.
export const Chat = (props: ChatProps) => {
	const { i18n } = useTranslation('app')
	const { pluginEnabled } = usePlugins()

	return i18n.language === 'en' && pluginEnabled('staking_api') ? (
		<Conversation {...props} />
	) : null
}
