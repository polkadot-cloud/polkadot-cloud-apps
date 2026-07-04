// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { shuffle } from '@w3ux/utils'
import type {
	ValidatorEntry,
	ValidatorSupportedNetwork,
} from '@w3ux/validator-assets'
import {
	ValidatorCommunity,
	validatorListSupported,
} from '@w3ux/validator-assets'
import { useCallback } from 'react'
import type { OperatorsHookInterface } from './types'

export type { OperatorsHookInterface } from './types'

const validatorOperators: ValidatorEntry[] = [...shuffle(ValidatorCommunity)]

export const useOperators = (): OperatorsHookInterface => {
	const getNetworkOperators = useCallback((network: string) => {
		if (!validatorListSupported(network)) {
			return []
		}
		return validatorOperators.filter(
			(v) => v.validators[network as ValidatorSupportedNetwork] !== undefined,
		)
	}, [])

	return {
		validatorOperators,
		getNetworkOperators,
	}
}
