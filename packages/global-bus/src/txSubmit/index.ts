// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Unsub } from 'dedot/types'
import type { HexString } from 'dedot/utils'
import type { MaybeAddress } from 'types'
import { _uids } from './private'

export const uids$ = _uids.asObservable()

export let subs: Record<number, Unsub> = {}
let lastUid = 0

export const getUid = (id: number) =>
	_uids.getValue().find((item) => item.uid === id)

export const addUid = ({
	network,
	from,
	tag,
}: {
	network: string
	from: MaybeAddress
	tag?: string
}) => {
	let newUids = [..._uids.getValue()]
	// Ensure uid is unique
	const newUid = ++lastUid
	// Move the tag to the new draft while keeping active attempts until they finish.
	if (tag) {
		newUids = newUids.flatMap((item) => {
			if (item.tag !== tag) return [item]
			return item.submitted || item.pending ? [{ ...item, tag: undefined }] : []
		})
	}
	newUids.push({
		uid: newUid,
		network,
		submitted: false,
		broadcasted: false,
		pending: false,
		from,
		fee: 0n,
		tag,
	})
	_uids.next(newUids)
	return newUid
}

export const removeUid = (id: number) => {
	const newUids = [..._uids.getValue()].filter(({ uid }) => uid !== id)
	_uids.next(newUids)
}

export const setUidSubmitted = (
	id: number,
	newSubmitted: boolean,
	signer?: { from: string; genesisHash: HexString },
) => {
	const newUids = [..._uids.getValue()].map((item) =>
		item.uid === id
			? {
					...item,
					...signer,
					submitted: newSubmitted,
					broadcasted:
						newSubmitted && !item.submitted ? false : item.broadcasted,
				}
			: item,
	)
	_uids.next(newUids)
}

export const setUidPending = (id: number, newPending: boolean) => {
	const newUids = [..._uids.getValue()].map((item) =>
		item.uid === id ? { ...item, pending: newPending } : item,
	)
	_uids.next(newUids)
}

export const setUidBroadcasted = (id: number) => {
	const newUids = [..._uids.getValue()].map((item) =>
		item.uid === id ? { ...item, broadcasted: true } : item,
	)
	_uids.next(newUids)
}

export const updateFee = (uid: number, fee: bigint) => {
	const newUids = [..._uids.getValue()].map((item) =>
		item.uid === uid ? { ...item, fee } : item,
	)
	_uids.next(newUids)
}

export const removeSub = (uid: number) => {
	const sub = subs[uid]
	if (sub) {
		subs = Object.fromEntries(
			Object.entries(subs).filter(([key]) => Number(key) !== uid),
		)
		void sub().catch(() => {})
	}
}

export const deleteTx = (uid: number) => {
	setUidSubmitted(uid, false)
	setUidPending(uid, false)
	removeUid(uid)
	removeSub(uid)
}

export const pendingTxCount = (from: string, genesisHash: HexString) =>
	_uids
		.getValue()
		.filter(
			(item) =>
				item.from === from && item.genesisHash === genesisHash && item.pending,
		).length

export * from './submit'
