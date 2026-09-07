// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { identities } from '../resources/identities'
import {
	activeNominatorCount,
	nominationBacking,
	nominationStatuses,
} from '../resources/nominations'
import { tokenPrice } from '../resources/prices'
import {
	validatorDetails,
	validatorEntries,
	validatorOverviews,
} from '../resources/validators'
import { useDataResource } from './provider'

export const useNominationStatuses = (
	who: string | null | undefined,
	targets: readonly string[],
	enabled = true,
) => useDataResource(nominationStatuses(who, targets, enabled))
export const useNominationBacking = (
	who: string | null | undefined,
	address: string,
	enabled = true,
) => useDataResource(nominationBacking(who, address, enabled))
export const useActiveNominatorCount = () =>
	useDataResource(activeNominatorCount())
export const useValidatorOverviews = () => useDataResource(validatorOverviews())
export const useValidatorDirectory = () => useDataResource(validatorEntries())
export const useValidatorDetails = (
	addresses: readonly string[],
	enabled = true,
) => useDataResource(validatorDetails(addresses, enabled))
export const useIdentities = (addresses: readonly string[]) =>
	useDataResource(identities(addresses))
export const useTokenPrice = (ticker: string) =>
	useDataResource(tokenPrice(ticker))
