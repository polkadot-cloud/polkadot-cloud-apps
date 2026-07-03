// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Validator } from 'types'

export interface FavoriteValidatorsHookInterface {
	addFavorite: (address: string) => void
	removeFavorite: (address: string) => void
	favorites: string[]
	favoritesList: Validator[] | null
}
