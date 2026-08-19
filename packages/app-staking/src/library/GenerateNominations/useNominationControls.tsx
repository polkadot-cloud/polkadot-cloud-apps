// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons'
import { MaxNominations } from 'consts'
import { useManageNominations } from 'contexts/ManageNominations'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { useFetchMethods } from 'hooks/useFetchMethods'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useUi } from 'hooks/useUi'
import { Confirm } from 'library/Prompt/Confirm'
import type { ValidatorCandidateStrategy } from 'plugin-staking-api/types'
import { type ComponentType, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AnyFunction, Validator } from 'types'
import { usePrompt } from 'ui-overlay'
import { SearchValidators } from './Prompts/SearchValidators'
import { SelectFavorites } from './Prompts/SelectFavorites'
import type {
	AddNominationsType,
	FilterHandler,
	PromptProps,
	SelectHandler,
} from './types'

interface UseNominationControlsProps {
	allowFavorites: boolean
	canManageNominations: boolean
	setters: AnyFunction[]
}

export const useNominationControls = ({
	allowFavorites,
	canManageNominations,
	setters,
}: UseNominationControlsProps) => {
	const { t } = useTranslation()
	const {
		add: addNomination,
		available: availableToNominate,
		fetch: fetchNominations,
		fetchCandidate,
	} = useFetchMethods()
	const { advancedMode } = useUi()
	const { favoritesList } = useFavoriteValidators()
	const { openPromptWith, closePrompt } = usePrompt()
	const { method, nominations, setNominations, updateSetters } =
		useManageNominations()
	const { retainmentStatsEnabled, stakingApiEnabled } = useNominationHealth()

	// Track whether a candidate is being fetched asynchronously.
	const [candidateFetching, setCandidateFetching] = useState(false)

	// Keep local and externally supplied nomination state in sync.
	const updateNominations = (nextNominations: Validator[]) => {
		setNominations([...nextNominations])
		updateSetters(setters, nextNominations)
	}

	const addNominationByType = async (type: AddNominationsType) => {
		if (!canManageNominations || !method || candidateFetching) {
			return
		}

		// Retainment-backed performance candidates require an asynchronous lookup.
		const trackCandidateRequest =
			type === 'High Performance Validator' && retainmentStatsEnabled
		if (trackCandidateRequest) {
			setCandidateFetching(true)
		}

		try {
			updateNominations(await addNomination(nominations, type))
		} finally {
			if (trackCandidateRequest) {
				setCandidateFetching(false)
			}
		}
	}

	const addCandidateByStrategy = async (
		strategy: ValidatorCandidateStrategy,
	) => {
		if (
			!canManageNominations ||
			!retainmentStatsEnabled ||
			!method ||
			candidateFetching ||
			nominations.length >= MaxNominations
		) {
			return
		}

		setCandidateFetching(true)
		try {
			const candidate = await fetchCandidate(nominations, strategy)
			const alreadyNominated = nominations.some(
				({ address }) => address === candidate?.address,
			)
			if (candidate && !alreadyNominated) {
				updateNominations([...nominations, candidate])
			}
		} finally {
			setCandidateFetching(false)
		}
	}

	const removeNominations = ({
		selected,
		callback,
	}: {
		selected: Validator[]
		callback?: AnyFunction
	}) => {
		const selectedAddresses = new Set(selected.map(({ address }) => address))
		updateNominations(
			nominations.filter(({ address }) => !selectedAddresses.has(address)),
		)
		callback?.()
	}

	const openSelectionPrompt = (Prompt: ComponentType<PromptProps>) => {
		const callback = (nextNominations: Validator[]) => {
			updateNominations(nextNominations)
			closePrompt()
		}
		openPromptWith(
			<Prompt callback={callback} nominations={nominations} />,
			'lg',
		)
	}

	const maxNominationsReached = nominations.length >= MaxNominations
	const addDisabled = !canManageNominations || maxNominationsReached
	const candidateDisabled = addDisabled || candidateFetching
	const availableNominations =
		retainmentStatsEnabled || !canManageNominations
			? null
			: availableToNominate(nominations)

	const selectHandler: SelectHandler = {
		title: t('removeSelected', { ns: 'app' }),
		popover: {
			text: t('removeSelectedItems', { ns: 'app' }),
			node: Confirm,
			callback: removeNominations,
		},
	}

	// Build filter controls in their display order.
	const filterHandlers: FilterHandler[] = []

	if (allowFavorites && advancedMode) {
		filterHandlers.push({
			title: t('addFromFavorites', { ns: 'app' }),
			onClick: () => openSelectionPrompt(SelectFavorites),
			isDisabled: () => addDisabled || !favoritesList?.length,
		})
	}

	filterHandlers.push({
		title: t('highPerformanceValidator', { ns: 'app' }),
		onClick: () => addNominationByType('High Performance Validator'),
		icon: faPlus,
		isDisabled: () =>
			candidateDisabled ||
			(!retainmentStatsEnabled &&
				!availableNominations?.highPerformance.length),
	})

	if (retainmentStatsEnabled) {
		filterHandlers.push(
			{
				title: t('highRetainer', { ns: 'app' }),
				onClick: () => addCandidateByStrategy('HIGH_RETAINER'),
				icon: faPlus,
				isDisabled: () => candidateDisabled,
			},
			{
				title: t('highCompounder', { ns: 'app' }),
				onClick: () => addCandidateByStrategy('HIGH_COMPOUNDER'),
				icon: faPlus,
				isDisabled: () => candidateDisabled,
			},
		)
	} else {
		filterHandlers.push(
			{
				title: t('activeValidator', { ns: 'app' }),
				onClick: () => addNominationByType('Active Validator'),
				icon: faPlus,
				isDisabled: () =>
					addDisabled || !availableNominations?.activeValidators.length,
			},
			{
				title: t('randomValidator', { ns: 'app' }),
				onClick: () => addNominationByType('Random Validator'),
				icon: faPlus,
				isDisabled: () =>
					addDisabled || !availableNominations?.randomValidators.length,
			},
		)
	}

	if (stakingApiEnabled) {
		filterHandlers.push({
			title: t('validatorSearch.searchValidators', { ns: 'app' }),
			onClick: () => openSelectionPrompt(SearchValidators),
			icon: faMagnifyingGlass,
			isDisabled: () => addDisabled,
		})
	}

	return {
		fetchNominations,
		filterHandlers,
		selectHandler,
		updateNominations,
	}
}
