// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface InvitesHookInterface {
	dismissInvite: () => void
	acknowledged: boolean
	setAcknowledged: (acknowledged: boolean) => void
	inviteConfig: InviteConfig | undefined
}

export type InviteType = 'pool' | 'validator'

export interface InviteConfig {
	type: InviteType
	network: string
	invite: PoolInvite
}

export type LocalInviteConfig = InviteConfig & {
	acknowledged: boolean
}

export type PoolInvite = {
	poolId: number
}
