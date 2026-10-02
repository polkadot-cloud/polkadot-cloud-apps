// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, SetStateAction } from 'react'
import type { AnyFunction, Validator } from 'types'

export interface ManageNominationsContextInterface {
	method: string | null
	setMethod: Dispatch<SetStateAction<string | null>>
	fetching: boolean
	setFetching: Dispatch<SetStateAction<boolean>>
	defaultNominations: Validator[]
	nominations: Validator[]
	setNominations: Dispatch<SetStateAction<Validator[]>>
	updateSetters: (setters: AnyFunction[], nominations: Validator[]) => void
}
