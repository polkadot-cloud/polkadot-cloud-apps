// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test, vi } from 'vitest'
import { createElement } from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { createInstance } from '../../locales/node_modules/i18next/index.js'
import { I18nextProvider } from '../../ui-chat/node_modules/react-i18next/dist/es/index.js'
import { Chat } from '../../ui-chat/src/Chat'

const { state, conversation } = vi.hoisted(() => ({
	state: { api: true },
	conversation: vi.fn(() => 'guidance-chat'),
}))
vi.mock('../../hooks/src/usePlugins', () => ({
	usePlugins: () => ({
		pluginEnabled: (plugin: string) => plugin === 'staking_api' && state.api,
	}),
}))
vi.mock('../../ui-chat/src/Chat/Conversation', () => ({
	Conversation: conversation,
}))

test.each([
	['en', true, true],
	['en', false, false],
	['de', true, false],
	['de', false, false],
	['en-US', true, false],
	['unknown', true, false],
] as const)(
	'language=%s staking API=%s mounts chat=%s',
	async (language, api, available) => {
		state.api = api
		conversation.mockClear()
		const i18n = createInstance()
		await i18n.init({
			lng: language,
			fallbackLng: 'en',
			resources: { en: { app: { title: 'Nominate' } } },
		})
		// English fallback must not enable chat for a different active language.
		expect(i18n.resolvedLanguage).toBe('en')
		const markup = renderToStaticMarkup(
			createElement(
				I18nextProvider,
				{ i18n },
				createElement(Chat, { endpoint: 'https://messaging.example' }),
			),
		)
		expect(markup).toBe(available ? 'guidance-chat' : '')
		expect(conversation).toHaveBeenCalledTimes(available ? 1 : 0)
	},
)
