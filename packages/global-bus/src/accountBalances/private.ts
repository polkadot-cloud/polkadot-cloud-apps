// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { AccountBalance } from 'types'

type Chain = string
type Address = string
type State = Record<Chain, Record<Address, AccountBalance>>

export const _accountBalances = new BehaviorSubject<State>({})
