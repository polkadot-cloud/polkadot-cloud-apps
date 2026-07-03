// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Item, OperatorsSectionsContextInterface } from './types'

export const defaultOperatorItem: Item = {
	name: '',
	icon: '',
	validators: {},
}

export const defaultContext: OperatorsSectionsContextInterface = {
	setActiveSection: (_t) => {},
	activeSection: 0,
	activeItem: defaultOperatorItem,
	setActiveItem: (_item) => {},
	scrollPos: 0,
	setScrollPos: (_scrollPos) => {},
}
