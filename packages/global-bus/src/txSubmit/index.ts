// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Unsub } from 'dedot/types'
import type { MaybeAddress } from 'types'
import { _uids } from './private'

export const uids$ = _uids.asObservable()

export let subs: Record<number, Unsub> = {}

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
	const newUid = newUids.length + 1
	// If tag already exists, delete the entry
	if (tag) {
		newUids = newUids.filter((item) => item.tag !== tag)
	}
	newUids.push({
		uid: newUid,
		network,
		submitted: false,
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

export const setUidSubmitted = (id: number, newSubmitted: boolean) => {
	const newUids = [..._uids.getValue()].map((item) =>
		item.uid === id ? { ...item, submitted: newSubmitted } : item,
	)
	_uids.next(newUids)
}

export const setUidPending = (id: number, newPending: boolean) => {
	const newUids = [..._uids.getValue()].map((item) =>
		item.uid === id ? { ...item, pending: newPending } : item,
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
		sub()
		subs = Object.fromEntries(
			Object.entries(subs).filter(([key]) => Number(key) !== uid),
		)
	}
}

export const deleteTx = (uid: number) => {
	setUidSubmitted(uid, false)
	setUidPending(uid, false)
	removeUid(uid)
	removeSub(uid)
}

export const pendingTxCount = (network: string, from: string) =>
	_uids
		.getValue()
		.filter(
			(item) => item.network === network && item.from === from && item.pending,
		).length

export * from './submit'
