// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { MaxNominations } from 'consts'
import { useEraStakers } from 'contexts/EraStakers'
import { useManageNominations } from 'contexts/ManageNominations'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { pluginEnabled } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { useFetchMethods } from 'hooks/useFetchMethods'
import { useUi } from 'hooks/useUi'
import { Confirm } from 'library/Prompt/Confirm'
import { ValidatorList } from 'library/ValidatorList'
import { Subheading } from 'pages/Nominate/Wrappers'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { AnyFunction, AnyJson, Validator } from 'types'
import { usePrompt } from 'ui-overlay'
import { ListControls } from './Controls/ListControls'
import { Methods } from './Methods'
import { SearchValidators } from './Prompts/SearchValidators'
import { SelectFavorites } from './Prompts/SelectFavorites'
import type {
	AddNominationsType,
	FilterHandlers,
	GenerateNominationsProps,
	SelectHandler,
} from './types'
import { Wrapper } from './Wrapper'

export const GenerateNominations = ({
	setters = [],
	displayFor = 'default',
}: GenerateNominationsProps) => {
	const { t } = useTranslation()
	const {
		eraStakers: { stakers },
	} = useEraStakers()
	const {
		fetch: fetchFromMethod,
		add: addNomination,
		available: availableToNominate,
	} = useFetchMethods()
	const { isReady } = useApi()
	const { advancedMode } = useUi()
	const { activeAddress } = useActiveAccount()
	const { favoritesList } = useFavoriteValidators()
	const { openPromptWith, closePrompt } = usePrompt()
	const { isReadOnlyAccount } = useImportedAccounts()
	const { getValidators, validatorsFetched } = useValidators()
	const {
		method,
		height,
		fetching,
		setHeight,
		heightRef,
		setMethod,
		setFetching,
		nominations,
		updateSetters,
		setNominations,
		defaultNominations,
	} = useManageNominations()

	const defaultNominationsCount = defaultNominations.length

	const resizeCallback = () => {
		setHeight(null)
	}

	// Fetch nominations based on method
	const fetchNominationsForMethod = () => {
		if (method) {
			const newNominations = fetchFromMethod(method)
			setNominations([...newNominations])
			setFetching(false)
			updateSetters(setters, newNominations)
		}
	}

	// Add nominations based on method
	const addNominationByType = (type: AddNominationsType) => {
		if (method) {
			const newNominations = addNomination(nominations, type)
			setNominations([...newNominations])
			updateSetters(setters, [...newNominations])
		}
	}

	const maxNominationsReached = MaxNominations <= nominations?.length

	// Define handlers
	const selectHandlers: Record<string, SelectHandler> = {
		removeSelected: {
			title: `${t('removeSelected', { ns: 'app' })}`,
			popover: {
				text: t('removeSelectedItems', { ns: 'app' }),
				node: Confirm,
				callback: ({
					selected,
					callback,
				}: {
					selected: AnyJson
					callback?: AnyFunction
				}) => {
					const selectedAddresses = new Set(
						selected.map(({ address }: { address: string }) => address),
					)
					const newNominations = nominations.filter(
						(n) => !selectedAddresses.has(n.address),
					)
					setNominations(newNominations)
					updateSetters(setters, newNominations)
					if (typeof callback === 'function') {
						callback()
					}
				},
			},
			onSelected: true,
			isDisabled: () => false,
		},
	}

	let filterHandlers: FilterHandlers = {}

	if (advancedMode) {
		filterHandlers.addFromFavorites = {
			title: t('addFromFavorites', { ns: 'app' }),
			onClick: () => {
				const updateList = (newNominations: Validator[]) => {
					setNominations([...newNominations])
					updateSetters(setters, newNominations)
					closePrompt()
				}
				openPromptWith(
					<SelectFavorites callback={updateList} nominations={nominations} />,
					'lg',
				)
			},
			onSelected: false,
			isDisabled: () =>
				!favoritesList?.length || MaxNominations <= nominations?.length,
		}
	}

	filterHandlers = {
		...filterHandlers,
		highPerformance: {
			title: t('highPerformanceValidator', { ns: 'app' }),
			onClick: () => addNominationByType('High Performance Validator'),
			onSelected: false,
			icon: faPlus,
			isDisabled: () =>
				maxNominationsReached ||
				!availableToNominate(nominations).highPerformance.length,
		},
		getActive: {
			title: t('activeValidator', { ns: 'app' }),
			onClick: () => addNominationByType('Active Validator'),
			onSelected: false,
			icon: faPlus,
			isDisabled: () =>
				maxNominationsReached ||
				!availableToNominate(nominations).activeValidators.length,
		},
		getRandom: {
			title: t('randomValidator', { ns: 'app' }),
			onClick: () => addNominationByType('Random Validator'),
			onSelected: false,
			icon: faPlus,
			isDisabled: () =>
				maxNominationsReached ||
				!availableToNominate(nominations).randomValidators.length,
		},
	}

	if (pluginEnabled('staking_api')) {
		filterHandlers.searchValidators = {
			title: 'Search Validators',
			onClick: () => {
				const updateList = (newNominations: Validator[]) => {
					setNominations([...newNominations])
					updateSetters(setters, newNominations)
					closePrompt()
				}
				openPromptWith(
					<SearchValidators callback={updateList} nominations={nominations} />,
					'lg',
				)
			},
			icon: faMagnifyingGlass,
			onSelected: false,
			isDisabled: () => MaxNominations <= nominations?.length,
		}
	}

	// Update nominations on account switch, or if `defaultNominations` change
	useEffect(() => {
		if (
			JSON.stringify(nominations) !== JSON.stringify(defaultNominations) &&
			defaultNominationsCount > 0
		) {
			setNominations([...(defaultNominations || [])])
			if (defaultNominationsCount) {
				setMethod('manual')
			}
		}
	}, [activeAddress, defaultNominations])

	// Refetch if fetching is triggered
	useEffect(() => {
		if (
			!isReady ||
			!getValidators()?.length ||
			!stakers?.length ||
			validatorsFetched !== 'synced'
		) {
			return
		}

		if (fetching) {
			fetchNominationsForMethod()
		}
	})

	// Reset fixed height on window size change
	useEffect(() => {
		window.addEventListener('resize', resizeCallback)
		return () => {
			window.removeEventListener('resize', resizeCallback)
		}
	}, [])

	return (
		<Wrapper
			style={{
				height: height ? `${height}px` : 'auto',
				marginTop: method ? '1rem' : 0,
			}}
		>
			<div>
				{!isReadOnlyAccount(activeAddress) && !method && (
					<>
						<Subheading>
							<h4>
								{t('chooseValidators2', {
									maxNominations: MaxNominations,
									ns: 'app',
								})}
							</h4>
						</Subheading>
						<Methods
							setMethod={setMethod}
							setNominations={setNominations}
							setFetching={setFetching}
							key="methods"
						/>
					</>
				)}
			</div>
			{fetching
				? null
				: isReady &&
					method !== null && (
						<div ref={heightRef}>
							<ValidatorList
								bondFor="nominator"
								validators={nominations}
								allowMoreCols
								allowListFormat={false}
								displayFor={displayFor}
								selectable
								BeforeListNode={
									<ListControls
										selectHandlers={selectHandlers}
										filterHandlers={Object.values(filterHandlers)}
										displayFor={displayFor}
									/>
								}
								onRemove={selectHandlers?.removeSelected?.popover.callback}
							/>
						</div>
					)}
		</Wrapper>
	)
}
