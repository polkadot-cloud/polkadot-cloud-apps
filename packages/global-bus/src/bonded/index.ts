// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Bonded } from 'types'
import { _bonded } from './private'

export const bonded$ = _bonded.asObservable()

export const resetBonded = () => {
	_bonded.next([])
}

export const getBonded = (address: string): Bonded | undefined =>
	_bonded.getValue()?.find((b) => b.stash === address)

export const setBonded = (value: Bonded) => {
	const next = [..._bonded.getValue()]
	next.push(value)
	_bonded.next(next)
}

export const removeBonded = (address: string) => {
	const next = [..._bonded.getValue()]
	const index = next.findIndex((b) => b.stash === address)
	if (index === -1) {
		return
	}
	next.splice(index, 1)
	_bonded.next(next)
}
