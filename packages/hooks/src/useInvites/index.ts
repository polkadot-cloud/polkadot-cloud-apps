// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { extractUrlValue } from '@w3ux/utils'
import { useCallback, useEffect } from 'react'
import type { NetworkId } from 'types'
import { useNetwork } from '../useNetwork'
import { createSingletonStore, useSingletonStore } from '../util'
import {
	acknowledgeLocalInvite,
	getLocalInviteConfig,
	removeLocalInviteConfig,
	setLocalInviteConfig,
} from './local'
import type {
	InviteConfig,
	InvitesHookInterface,
	InviteType,
	LocalInviteConfig,
} from './types'

export type {
	InviteConfig,
	InvitesHookInterface,
	InviteType,
	LocalInviteConfig,
	PoolInvite,
} from './types'

type InvitesState = {
	acknowledged: boolean
	inviteConfig: InviteConfig | undefined
}

let inviteUrlSynced = false

const toInviteConfig = ({
	acknowledged: _acknowledged,
	...inviteConfig
}: LocalInviteConfig): InviteConfig => inviteConfig

const getInitialInvitesState = (): InvitesState => {
	const localInvite = getLocalInviteConfig()
	return {
		acknowledged: localInvite?.acknowledged ?? true,
		inviteConfig: localInvite ? toInviteConfig(localInvite) : undefined,
	}
}

const serverInvitesSnapshot: InvitesState = {
	acknowledged: true,
	inviteConfig: undefined,
}

const invitesStore = createSingletonStore<InvitesState>(
	getInitialInvitesState,
	{
		serverSnapshot: serverInvitesSnapshot,
	},
)

const syncInviteFromUrl = (network: NetworkId) => {
	if (inviteUrlSynced) {
		return
	}
	inviteUrlSynced = true

	const idFromUrl = extractUrlValue('id')
	if (extractUrlValue('i') === 'pool' && !isNaN(Number(idFromUrl))) {
		const type: InviteType = 'pool'
		const inviteConfig: InviteConfig = {
			type,
			network,
			invite: {
				poolId: Number(idFromUrl),
			},
		}
		setLocalInviteConfig({
			...inviteConfig,
			acknowledged: false,
		})
		invitesStore.setSnapshot({
			acknowledged: false,
			inviteConfig,
		})
	}
}

export const useInvites = (): InvitesHookInterface => {
	const { network } = useNetwork()
	const { acknowledged, inviteConfig } = useSingletonStore(invitesStore)

	useEffect(() => {
		syncInviteFromUrl(network)
	}, [network])

	const setAcknowledged = useCallback((ack: boolean) => {
		acknowledgeLocalInvite(ack)
		invitesStore.patchSnapshot({ acknowledged: ack })
	}, [])

	const dismissInvite = useCallback(() => {
		removeLocalInviteConfig()
		invitesStore.patchSnapshot({ inviteConfig: undefined })
	}, [])

	return {
		dismissInvite,
		acknowledged,
		setAcknowledged,
		inviteConfig,
	}
}
