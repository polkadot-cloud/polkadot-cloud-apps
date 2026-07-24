// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const STAKING_API_ENDPOINT = 'https://api.staking.polkadot.cloud'

const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: new HttpLink({
		uri: STAKING_API_ENDPOINT,
	}),
})

export { client }
