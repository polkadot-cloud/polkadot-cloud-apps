// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { PoolMembershipState } from 'types'

type State = Record<string, PoolMembershipState>
export const _poolMemberships = new BehaviorSubject<State>({})
