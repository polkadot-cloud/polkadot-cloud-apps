// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { MaxNominations } from 'consts'
import { useEraStakers } from 'contexts/EraStakers'
import { useManageNominations } from 'contexts/ManageNominations'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { emitNotification, pluginEnabled } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { useFetchMethods } from 'hooks/useFetchMethods'
import { useNetwork } from 'hooks/useNetwork'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import { useUi } from 'hooks/useUi'
import { getIdentityDisplay } from 'library/List/Utils'
import { Confirm } from 'library/Prompt/Confirm'
import { ValidatorList } from 'library/ValidatorList'
import { useValidatorDetails } from 'library/ValidatorList/useValidatorDetails'
import { Subheading } from 'pages/Nominate/Wrappers'
import { fetchSearchValidators } from 'plugin-staking-api'
import type { ValidatorCandidateStrategy } from 'plugin-staking-api/types'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AnyFunction, Validator } from 'types'
import { Loader } from 'ui-core/base'
import { usePrompt } from 'ui-overlay'
import { ListControls } from './Controls/ListControls'
import { Methods } from './Methods'
import { NominationHealth } from './NominationHealth'
import { SearchValidators } from './Prompts/SearchValidators'
import { SelectFavorites } from './Prompts/SelectFavorites'
import type {
	AddNominationsType,
	FilterHandlers,
	GenerateNominationsProps,
	SelectHandler,
} from './types'
import { Wrapper } from './Wrapper'

const POLKADOT_CLOUD_VALIDATOR_NAME = 'Polkadot Cloud Validator 1'
const normalizeIdentity = (value: string) =>
	value.toLowerCase().replace(/[^a-z0-9]/g, '')
const identityMatches = (...parts: Array<string | null | undefined>) => {
	const target = normalizeIdentity(POLKADOT_CLOUD_VALIDATOR_NAME)
	const labels = parts.filter((part): part is string => !!part)
	return (
		labels.some((label) => normalizeIdentity(label) === target) ||
		normalizeIdentity(labels.join(' ')) === target ||
		normalizeIdentity([...labels].reverse().join(' ')) === target
	)
}

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
		fetchCandidate,
		add: addNomination,
		available: availableToNominate,
	} = useFetchMethods()
	const { isReady } = useApi()
	const { network } = useNetwork()
	const { advancedMode } = useUi()
	const { activeAddress } = useActiveAccount()
	const { favoritesList } = useFavoriteValidators()
	const { openPromptWith, closePrompt } = usePrompt()
	const { isReadOnlyAccount } = useImportedAccounts()
	const {
		getValidators,
		validatorIdentities,
		validatorSupers,
		validatorsFetched,
	} = useValidators()
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
	const fetchingRef = useRef(false)
	const [candidateFetching, setCandidateFetching] = useState(false)
	const { active: healthCheckActive } = useNominationHealth({
		isFixing: candidateFetching,
	})
	const stakingApiEnabled = pluginEnabled('staking_api')
	const retainmentStatsEnabled = useRetainmentStatsEnabled()
	const validatorDetails = useValidatorDetails(
		nominations.map(({ address }) => address),
		retainmentStatsEnabled && isReady && method !== null && !fetching,
	)

	const resizeCallback = () => {
		setHeight(null)
	}

	// Fetch nominations based on method
	const fetchNominationsForMethod = async () => {
		if (method && !fetchingRef.current) {
			fetchingRef.current = true
			try {
				const newNominations = await fetchFromMethod(method)
				setNominations([...newNominations])
				updateSetters(setters, newNominations)
			} finally {
				setFetching(false)
				fetchingRef.current = false
			}
		}
	}

	// Add nominations based on method
	const addNominationByType = async (type: AddNominationsType) => {
		if (method && !candidateFetching) {
			const fetchingCandidate =
				type === 'High Performance Validator' && retainmentStatsEnabled
			if (fetchingCandidate) {
				setCandidateFetching(true)
			}

			try {
				const newNominations = await addNomination(nominations, type)
				setNominations([...newNominations])
				updateSetters(setters, [...newNominations])
			} finally {
				if (fetchingCandidate) {
					setCandidateFetching(false)
				}
			}
		}
	}

	const addCandidateByStrategy = async (
		strategy: ValidatorCandidateStrategy,
	) => {
		if (
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
			if (
				!candidate ||
				nominations.some(({ address }) => address === candidate.address)
			) {
				return
			}

			const newNominations = [...nominations, candidate]
			setNominations(newNominations)
			updateSetters(setters, newNominations)
		} finally {
			setCandidateFetching(false)
		}
	}

	const getPolkadotCloudValidator = async (): Promise<Validator | null> => {
		const localValidator = getValidators().find(({ address }) => {
			const identity = getIdentityDisplay(
				validatorIdentities[address],
				validatorSupers[address],
			).data
			return identityMatches(identity?.display, identity?.super)
		})
		if (localValidator) {
			return localValidator
		}

		const { searchValidators } = await fetchSearchValidators(
			network,
			POLKADOT_CLOUD_VALIDATOR_NAME,
		)
		const searchValidator =
			searchValidators.validators.find(({ display, superDisplay }) =>
				identityMatches(display, superDisplay),
			) ||
			(searchValidators.validators.length === 1
				? searchValidators.validators[0]
				: undefined)

		return searchValidator
			? {
					address: searchValidator.address,
					prefs: {
						blocked: searchValidator.blocked,
						commission: searchValidator.commission,
					},
				}
			: null
	}

	const getHealthCheckFallback = async (): Promise<Validator[] | null> => {
		const cloudValidator = await getPolkadotCloudValidator()
		if (!cloudValidator) {
			return null
		}

		const fallback = [cloudValidator]
		const strategies: ValidatorCandidateStrategy[] = [
			'ACTIVE',
			'HIGH_RETAINER',
			'HIGH_RETAINER',
		]
		for (const strategy of strategies) {
			const candidate = await fetchCandidate(fallback, strategy)
			if (
				!candidate ||
				fallback.some(({ address }) => address === candidate.address)
			) {
				return null
			}
			fallback.push(candidate)
		}

		return fallback
	}

	const fixRetainment = async (validatorsToRemove: Validator[]) => {
		if (candidateFetching) {
			return
		}

		setCandidateFetching(true)
		try {
			const removeAddresses = new Set(
				validatorsToRemove.map(({ address }) => address),
			)
			let nextNominations = nominations.filter(
				({ address }) => !removeAddresses.has(address),
			)

			if (nextNominations.length === 0) {
				const fallback = await getHealthCheckFallback()
				if (!fallback) {
					throw new Error('Unable to build nomination health check fallback')
				}
				nextNominations = fallback
			}

			setNominations(nextNominations)
			updateSetters(setters, nextNominations)
		} catch {
			emitNotification({
				title: t('errorUnknown', { ns: 'app' }),
				subtitle: t('tryAgain', { ns: 'app' }),
			})
		} finally {
			setCandidateFetching(false)
		}
	}

	const maxNominationsReached = MaxNominations <= nominations?.length
	const removeNominations = ({
		selected,
		callback,
	}: {
		selected: Validator[]
		callback?: AnyFunction
	}) => {
		const selectedAddresses = new Set(selected.map(({ address }) => address))
		const newNominations = nominations.filter(
			({ address }) => !selectedAddresses.has(address),
		)
		setNominations(newNominations)
		updateSetters(setters, newNominations)
		if (typeof callback === 'function') {
			callback()
		}
	}

	// Define handlers
	const selectHandlers: Record<string, SelectHandler> = {
		removeSelected: {
			title: `${t('removeSelected', { ns: 'app' })}`,
			popover: {
				text: t('removeSelectedItems', { ns: 'app' }),
				node: Confirm,
				callback: removeNominations,
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
				candidateFetching ||
				(!retainmentStatsEnabled &&
					!availableToNominate(nominations).highPerformance.length),
		},
	}

	if (retainmentStatsEnabled) {
		filterHandlers = {
			...filterHandlers,
			highRetainer: {
				title: t('highRetainer', { ns: 'app' }),
				onClick: () => addCandidateByStrategy('HIGH_RETAINER'),
				onSelected: false,
				icon: faPlus,
				isDisabled: () => candidateFetching || maxNominationsReached,
			},
			highCompounder: {
				title: t('highCompounder', { ns: 'app' }),
				onClick: () => addCandidateByStrategy('HIGH_COMPOUNDER'),
				onSelected: false,
				icon: faPlus,
				isDisabled: () => candidateFetching || maxNominationsReached,
			},
		}
	} else {
		filterHandlers = {
			...filterHandlers,
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
	}

	if (stakingApiEnabled) {
		filterHandlers = {
			...filterHandlers,
			searchValidators: {
				title: t('validatorSearch.searchValidators', { ns: 'app' }),
				onClick: () => {
					const updateList = (newNominations: Validator[]) => {
						setNominations([...newNominations])
						updateSetters(setters, newNominations)
						closePrompt()
					}
					openPromptWith(
						<SearchValidators
							callback={updateList}
							nominations={nominations}
						/>,
						'lg',
					)
				},
				icon: faMagnifyingGlass,
				onSelected: false,
				isDisabled: () => maxNominationsReached,
			},
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
			{isReady && method !== null && (
				<div ref={heightRef}>
					{fetching ? (
						<div
							aria-label={t('fetchingValidators', { ns: 'pages' })}
							aria-live="polite"
							role="status"
						>
							<Loader
								style={{
									height: '5.5rem',
									margin: '0.9rem',
									width: 'calc(100% - 1.8rem)',
								}}
							/>
						</div>
					) : (
						<ValidatorList
							validators={nominations}
							allowListFormat={false}
							displayFor={displayFor}
							selectable
							forceListFormat={!retainmentStatsEnabled ? 'col' : undefined}
							BeforeListNode={
								<>
									<ListControls
										selectHandlers={selectHandlers}
										filterHandlers={Object.values(filterHandlers)}
										displayFor={displayFor}
									/>
									{healthCheckActive && retainmentStatsEnabled && (
										<NominationHealth
											isLoading={validatorDetails.isLoading}
											onFix={fixRetainment}
											retainmentByAddress={validatorDetails.retainmentByAddress}
											validators={nominations}
										/>
									)}
								</>
							}
							onRemove={selectHandlers?.removeSelected?.popover.callback}
							validatorDetails={validatorDetails}
						/>
					)}
				</div>
			)}
		</Wrapper>
	)
}
