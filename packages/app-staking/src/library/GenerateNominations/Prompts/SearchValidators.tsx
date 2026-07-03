// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MaxNominations } from 'consts'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { emitNotification } from 'global-bus'
import { useNetwork } from 'hooks/useNetwork'
import { SearchInput } from 'library/List/SearchInput'
import { Identity } from 'library/ListItem/Labels/Identity'
import { FooterWrapper, PromptListItem } from 'library/Prompt/Wrappers'
import { StyledSlider } from 'library/StyledSlider'
import { fetchSearchValidators } from 'plugin-staking-api'
import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { ButtonPrimary } from 'ui-buttons'
import { Checkbox } from 'ui-core/list'
import { SearchList } from 'ui-core/modal'
import { Title } from 'ui-core/prompt'
import { usePrompt } from 'ui-overlay'
import type { PromptProps } from '../types'

export const SearchValidators = ({ callback, nominations }: PromptProps) => {
	const { t } = useTranslation()
	const { closePrompt } = usePrompt()
	const { network } = useNetwork()
	const { getValidators, validatorsFetched } = useValidators()

	// Number of validators to show by default when no search term is entered
	const defaultDisplayLimit = 50

	// Store the validators selected from search results
	const [selected, setSelected] = useState<Validator[]>([])

	// Store the search input value
	const [searchTerm, setSearchTerm] = useState<string>('')

	// Store search results from the staking API
	const [searchResults, setSearchResults] = useState<Validator[]>([])

	// Store loading state for search
	const [isSearching, setIsSearching] = useState<boolean>(false)

	// Store commission filter value (default 10%)
	const [maxCommission, setMaxCommission] = useState<number>(10)

	// Debounced search function
	const debouncedSearch = useCallback(
		async (term: string) => {
			if (term.length === 0) {
				setSearchResults([])
				setIsSearching(false)
				return
			}

			setIsSearching(true)
			try {
				const result = await fetchSearchValidators(network, term)
				if (result.searchValidators.validators.length > 0) {
					const transformedValidators: Validator[] =
						result.searchValidators.validators.map((validator) => ({
							address: validator.address,
							prefs: {
								commission: validator.commission,
								blocked: validator.blocked,
							},
						}))
					setSearchResults(transformedValidators)
				} else {
					setSearchResults([])
				}
			} catch {
				setSearchResults([])
			} finally {
				setIsSearching(false)
			}
		},
		[network],
	)

	// Debounce effect
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			debouncedSearch(searchTerm)
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [searchTerm, debouncedSearch])

	const addToSelected = (item: Validator) => {
		setSelected((prev) =>
			prev.some(({ address }) => address === item.address)
				? prev
				: prev.concat(item),
		)
	}

	const removeFromSelected = (items: Validator[]) => {
		const addresses = new Set(items.map((item) => item.address))
		setSelected((prev) => prev.filter((item) => !addresses.has(item.address)))
	}

	const remaining = MaxNominations - nominations.length - selected.length
	const canAdd = remaining > 0

	const handleSearchChange = (e: FormEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value
		setSearchTerm(value)
	}

	// Filter search results by commission
	const filteredSearchResults = searchResults.filter(
		(validator) => (validator.prefs?.commission || 0) <= maxCommission,
	)

	const hasSearchTerm = searchTerm.length > 0
	const validatorsSynced = validatorsFetched === 'synced'

	// When no search term is entered, show a capped, commission-filtered slice of
	// the full validator list (already loaded client-side via useValidators)
	const defaultValidators = getValidators()
		.filter((validator) => (validator.prefs?.commission || 0) <= maxCommission)
		.slice(0, defaultDisplayLimit)

	// The validators to render in the list area
	const displayValidators = hasSearchTerm
		? filteredSearchResults
		: defaultValidators

	return (
		<>
			<Title
				title={t('validatorSearch.searchValidators', { ns: 'app' })}
				onClose={closePrompt}
			/>
			<div className="padded">
				<h3 className="subheading">
					{t('validatorSearch.addToList', { ns: 'app' })}
				</h3>
				<SearchList.NominationsCounter
					current={nominations.length + selected.length}
					total={MaxNominations}
					remaining={remaining}
				/>

				{/* Two Column Layout */}
				<SearchList.Container>
					{/* Left Column - Search and Favorites (2/3 width) */}
					<SearchList.LeftColumn>
						<SearchInput
							value={searchTerm}
							handleChange={handleSearchChange}
							placeholder={`${t('validatorSearch.searchValidators', { ns: 'app' })}...`}
						/>

						{/* Commission Filter */}
						<div style={{ margin: '1rem 0' }}>
							<h5
								style={{
									marginBottom: '0.5rem',
									color: 'var(--gray-900)',
								}}
							>
								{t('maxCommission', { ns: 'modals' })}: {maxCommission}%
							</h5>
							<StyledSlider
								value={maxCommission}
								min={0}
								max={100}
								step={0.1}
								onChange={(val) => {
									if (typeof val === 'number') {
										setMaxCommission(val)
									}
								}}
							/>
						</div>

						{/* Results Section: search results when searching, otherwise a
						    default slice of the full validator list */}
						<div>
							<SearchList.SearchHeader>
								{isSearching
									? `${t('validatorSearch.searching', { ns: 'app' })}...`
									: hasSearchTerm
										? `${t('validatorSearch.searchResults', { ns: 'app' })} (${filteredSearchResults.length})`
										: `${t('validators', { ns: 'app' })} (${defaultValidators.length})`}
							</SearchList.SearchHeader>
							{isSearching || (!hasSearchTerm && !validatorsSynced) ? (
								<SearchList.Loading
									message={`${t(hasSearchTerm ? 'validatorSearch.searching' : 'waiting', { ns: 'app' })}...`}
								/>
							) : displayValidators.length > 0 ? (
								displayValidators.map((validator) => {
									const inInitial = !!nominations.find(
										({ address }) => address === validator.address,
									)
									const inSelected = selected.some(
										({ address }) => address === validator.address,
									)
									const disabled = !canAdd || inInitial

									return (
										<PromptListItem
											key={`search_result_${validator.address}`}
											className={disabled && inInitial ? 'inactive' : undefined}
										>
											<Checkbox
												checked={inInitial || inSelected}
												onClick={() => {
													if (inSelected) {
														removeFromSelected([validator])
													} else if (!disabled) {
														addToSelected(validator)
													}
												}}
											/>
											<Identity address={validator.address} />
										</PromptListItem>
									)
								})
							) : (
								<SearchList.NoResults />
							)}
						</div>
					</SearchList.LeftColumn>

					{/* Right Column - Selected Validators (1/3 width) */}
					<SearchList.RightColumn>
						<SearchList.Header>
							{t('validatorSearch.selectedValidators', {
								ns: 'app',
								count: selected.length,
							})}
						</SearchList.Header>

						{selected.length > 0 ? (
							<SearchList.SelectedList>
								{selected.map((validator: Validator) => (
									<PromptListItem key={`selected_${validator.address}`}>
										<Checkbox
											checked={true}
											onClick={() => {
												removeFromSelected([validator])
											}}
										/>
										<Identity address={validator.address} />
									</PromptListItem>
								))}
							</SearchList.SelectedList>
						) : (
							<SearchList.EmptyState
								message={t('noValidators', { ns: 'app' })}
							/>
						)}

						{selected.length > 0 && (
							<SearchList.ClearButton onClick={() => setSelected([])}>
								{t('validatorSearch.clearAllSelected', { ns: 'app' })}
							</SearchList.ClearButton>
						)}
					</SearchList.RightColumn>
				</SearchList.Container>

				<FooterWrapper>
					<ButtonPrimary
						text={t('addToNominations', { ns: 'modals' })}
						onClick={() => {
							callback(nominations.concat(selected))
							emitNotification({
								title: t('favoritesAddedTitle', {
									ns: 'modals',
									count: selected.length,
								}),
								subtitle: t('favoritesAddedSubtitle', {
									ns: 'modals',
									count: selected.length,
								}),
							})
						}}
						disabled={selected.length === 0}
					/>
				</FooterWrapper>
			</div>
		</>
	)
}
