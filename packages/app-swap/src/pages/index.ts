// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowsRotate,
	faDroplet,
	faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import type { PageItem } from 'types'
import { Liquidity } from './Liquidity'
import { Send } from './Send'
import { Swap } from './Swap'

export const pages: PageItem[] = [
	{ key: 'swap', Entry: Swap, faIcon: faArrowsRotate },
	{ key: 'send', Entry: Send, faIcon: faPaperPlane },
	{ key: 'liquidity', Entry: Liquidity, faIcon: faDroplet },
].map((page) => ({
	...page,
	category: 0,
	uri: `${import.meta.env.BASE_URL}${page.key}`,
	hash: `/${page.key}`,
	advanced: false,
}))
