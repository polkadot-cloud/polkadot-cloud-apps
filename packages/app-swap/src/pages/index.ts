// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowsRotate,
	faPaperPlane,
	faRoute,
} from '@fortawesome/free-solid-svg-icons'
import type { PageItem } from 'types'
import { CrossChain } from './CrossChain'
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
		key: 'crossChain',
		titleNamespace: 'swap',
		hash: '/cross-chain',
		Entry: CrossChain,
		faIcon: faRoute,
	},
].map((page) => ({
	...page,
	category: 0,
	uri: `${import.meta.env.BASE_URL}${page.hash.slice(1)}`,
	advanced: false,
}))
