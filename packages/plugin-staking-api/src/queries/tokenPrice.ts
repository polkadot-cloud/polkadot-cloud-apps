// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { TokenPriceData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query TokenPrice($ticker: String!) {
    tokenPrice(ticker: $ticker) {
      price
      change
    }
  }
`

const DEFAULT: TokenPriceData = {
	tokenPrice: {
		price: 0,
		change: 0,
	},
}

export const fetchTokenPrice = (ticker: string) =>
	fetchQuery<TokenPriceData>(QUERY, { ticker }, DEFAULT)

export const formatTokenPrice = (
	maybePrice: number | null,
	maybeChange: number | null,
): { price: number; change: number } => ({
	price: Number((maybePrice || 0).toFixed(2)),
	change: Number((maybeChange || 0).toFixed(2)),
})
