// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotPeopleApi } from '@dedot/chaintypes/polkadot-people'
import type { DedotClient } from 'dedot'
import { toStablecoinBalance } from '../stablecoins/shared'
import {
	type BalanceCallback,
	type ErrorCallback,
	StablecoinBalancesSubscription,
} from './stablecoinBalances'

export class PeopleBalancesQuery extends StablecoinBalancesSubscription {
	constructor(
		getApi: () => Promise<DedotClient<PolkadotPeopleApi>>,
		address: string,
		onBalance: BalanceCallback,
		onError: ErrorCallback,
	) {
		super(onBalance, onError)
		void getApi()
			.then((api) =>
				this.track(() =>
					api.query.system.account(address, ({ data }) => {
						this.emit(toStablecoinBalance('people-polkadot', 'DOT', data))
					}),
				),
			)
			.catch((error) => this.reportError(error))
	}
}
