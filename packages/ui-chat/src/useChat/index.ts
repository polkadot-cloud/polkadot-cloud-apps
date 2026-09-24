// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState, useSyncExternalStore } from 'react'
import { ChatClient } from '../client'
import type { GuidanceIntake } from '../types'
import type { ChatHookInterface } from './types'

export const useChat = (endpoint: string): ChatHookInterface => {
	const [client] = useState(() => new ChatClient(endpoint))
	const state = useSyncExternalStore(client.subscribe, client.getSnapshot)
	const [open, setOpenState] = useState(false)
	const [started, setStarted] = useState(false)
	const [draft, setDraft] = useState('')

	// Panel visibility does not own the connection. An initiated chat stays live
	// while the drawer is closed, and unmounting cancels its outstanding work.
	useEffect(() => {
		if (started) {
			client.start()
		}
		return () => client.stop()
	}, [client, started])

	const setOpen = (value: boolean) => {
		setOpenState(value)
		// Opening can resume a saved guest; a new guest must explicitly start.
		if (value && client.resumable) {
			setStarted(true)
		}
	}

	const start = () => setStarted(true)

	const startNew = () => {
		setDraft('')
		client.startNew()
	}

	const send = (intake?: GuidanceIntake) => {
		// The client retains the submitted body until persistence is confirmed.
		// Clear this draft immediately so an acknowledgement cannot erase later input.
		void client.send(state.pending?.body ?? draft, intake)
		setDraft('')
	}

	const loadOlder = () => {
		void client.loadOlder()
	}
	const editRejected = () => {
		if (!state.rejected || !state.pending) return
		setDraft(state.pending.body)
		client.editRejected()
	}

	return {
		state,
		open,
		started,
		draft,
		setDraft,
		setOpen,
		start,
		startNew,
		send,
		editRejected,
		loadOlder,
	}
}
