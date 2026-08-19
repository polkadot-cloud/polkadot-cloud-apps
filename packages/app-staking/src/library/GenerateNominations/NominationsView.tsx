// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { MaxNominations } from 'consts'
import { ListProvider } from 'contexts/List'
import { useManageNominations } from 'contexts/ManageNominations'
import { useApi } from 'hooks/useApi'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { ValidatorListInner } from 'library/ValidatorList'
import { useValidatorDetails } from 'library/ValidatorList/useValidatorDetails'
import { Subheading } from 'pages/Nominate/Wrappers'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from 'ui-app/Card'
import { Connect } from './Connect'
import { ListControls } from './Controls/ListControls'
import { Methods } from './Methods'
import { NominationHealth } from './NominationHealth'
import type { NominationsViewProps } from './types'
import { useAllValidatorsWaiting } from './useAllValidatorsWaiting'
import {
	NominationEditorWrapper,
	NominationsLoader,
	StandaloneCards,
	StandalonePreloader,
} from './Wrappers'

export const NominationsView = ({
	canManageNominations,
	displayFor,
	eligibilityLoading,
	filterHandlers,
	ineligibleStatus = 'notStaking',
	menuControls,
	selectHandler,
	standaloneCards,
}: NominationsViewProps) => {
	// Resolve shared application state before deriving view conditions.
	const { t } = useTranslation()
	const { activeAddress } = useActiveAccount()
	const { accountsInitialised, isReadOnlyAccount } = useImportedAccounts()
	const { isReady } = useApi()
	const { active: healthCheckActive, retainmentStatsEnabled } =
		useNominationHealth()
	const {
		fetching,
		height,
		heightRef,
		method,
		nominations,
		setFetching,
		setMethod,
		setNominations,
	} = useManageNominations()

	// Derive layout and visibility once for use across both presentation modes.
	const listReady = isReady && method !== null
	const listFormat = retainmentStatsEnabled ? 'row' : 'col'
	const showMethodSelection = !isReadOnlyAccount(activeAddress) && !method
	const showStandaloneControls =
		Boolean(activeAddress) &&
		canManageNominations &&
		!eligibilityLoading &&
		listReady

	// Load validator metrics only when the settled nomination list can use them.
	const validatorAddresses = nominations.map(({ address }) => address)
	const validatorDetails = useValidatorDetails(
		validatorAddresses,
		retainmentStatsEnabled && listReady && !fetching,
	)
	const allValidatorsWaiting = useAllValidatorsWaiting(nominations)

	// Reuse the same loading and control elements in either layout branch.
	const loading = (
		<div
			aria-label={t('fetchingValidators', { ns: 'pages' })}
			aria-live="polite"
			role="status"
		>
			<NominationsLoader $standalone={standaloneCards} />
		</div>
	)
	const standaloneLoading = (
		<div
			aria-label={t('initializing', { ns: 'app' })}
			aria-live="polite"
			role="status"
		>
			<StandalonePreloader $standalone />
		</div>
	)

	// Compose controls once; each layout decides where and when to render them.
	const listControls = (
		<ListControls
			filterHandlers={filterHandlers}
			selectHandler={selectHandler}
			standalone={standaloneCards}
		/>
	)

	// Health output moves into the card in standalone mode without changing data.
	const nominationHealth = healthCheckActive ? (
		<NominationHealth
			allValidatorsWaiting={allValidatorsWaiting}
			isLoading={validatorDetails.isLoading}
			retainmentByAddress={validatorDetails.retainmentByAddress}
			standalone={standaloneCards}
			validators={nominations}
		/>
	) : null

	// Standalone controls sit above the card; embedded controls remain in the list.
	const beforeList = standaloneCards ? (
		nominationHealth
	) : (
		<>
			{listControls}
			{nominationHealth}
		</>
	)

	// Render the loader and validator list within the same measured container.
	const nominationsList = listReady && (
		<div ref={heightRef}>
			{fetching ? (
				loading
			) : (
				<ValidatorListInner
					validators={nominations}
					allowListFormat={false}
					displayFor={displayFor}
					highlightRetainmentWarnings={healthCheckActive}
					selectable
					forceListFormat={listFormat === 'col' ? 'col' : undefined}
					BeforeListNode={beforeList}
					onRemove={selectHandler.popover.callback}
					validatorDetails={validatorDetails}
				/>
			)}
		</div>
	)

	// Resolve the standalone card state in account, loading, and eligibility order.
	const standaloneList = !accountsInitialised ? (
		standaloneLoading
	) : eligibilityLoading ? (
		standaloneLoading
	) : !activeAddress ? (
		<Connect />
	) : !canManageNominations ? (
		<Connect status={ineligibleStatus} />
	) : (
		<CardWrapper>{nominationsList}</CardWrapper>
	)

	return (
		<ListProvider selectable initialListFormat={listFormat}>
			{standaloneCards ? (
				<StandaloneCards>
					<CardWrapper className="transparent">
						{menuControls}
						{showStandaloneControls && listControls}
					</CardWrapper>
					{standaloneList}
				</StandaloneCards>
			) : (
				<NominationEditorWrapper
					style={{
						height: height ? `${height}px` : 'auto',
						marginTop: method ? '1rem' : 0,
					}}
				>
					<div>
						{showMethodSelection && (
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
									setFetching={setFetching}
									setMethod={setMethod}
									setNominations={setNominations}
								/>
							</>
						)}
					</div>
					{nominationsList}
				</NominationEditorWrapper>
			)}
		</ListProvider>
	)
}
