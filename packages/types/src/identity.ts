// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PalletIdentityJudgement } from 'dedot/chaintypes'
import type { AccountId32 } from 'dedot/codecs'

export type IdentityOf =
	| {
			info: {
				display: {
					type: string
					value?: string
				}
			}
			judgements: [number, PalletIdentityJudgement][]
			deposit: bigint
	  }
	| undefined

export type SuperOf =
	| {
			address: string
			account: AccountId32
			identity: IdentityOf
			value: {
				type: string
				value?: string
			}
	  }
	| undefined

export interface SuperIdentity {
	superOf: {
		identity: IdentityOf
		value: {
			type: string
			value?: string
		}
	}
	value: string
}

export interface RoleIdentities {
	identities: Record<string, IdentityOf>
	supers: Record<string, SuperIdentity>
}
