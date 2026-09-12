// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const STAKING_API_ENDPOINT = 'https://api.staking.polkadot.cloud'
const devToken = import.meta.env.DEV
	? import.meta.env.CLOUD_STAKING_API_AUTH_TOKEN?.trim()
	: undefined

const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: new HttpLink({
		uri: STAKING_API_ENDPOINT,
		headers: devToken ? { Authorization: `Bearer ${devToken}` } : {},
	}),
})

export { client }
