// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowRightArrowLeft,
	faArrowsRotate,
	faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import type { PageItem } from 'types'
import { Bridge } from './Bridge'
import { Send } from './Send'
import { Swap } from './Swap'

export const pages: PageItem[] = [
	{
		key: 'swap',
		titleNamespace: 'swap',
		hash: '/',
		Entry: Swap,
		faIcon: faArrowsRotate,
	},
	{ key: 'send', hash: '/send', Entry: Send, faIcon: faPaperPlane },
	{
		key: 'bridge',
		titleNamespace: 'swap',
		hash: '/cross-chain',
		Entry: Bridge,
		faIcon: faArrowRightArrowLeft,
	},
].map((page) => ({
	...page,
	category: 0,
	uri: `${import.meta.env.BASE_URL}${page.hash.slice(1)}`,
	advanced: false,
}))
