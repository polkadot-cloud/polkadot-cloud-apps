// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { MaxNominations } from 'consts'
import { ListProvider } from 'contexts/List'
import { useManageNominations } from 'contexts/ManageNominations'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useValidatorDetailsEnabled } from 'hooks/useValidatorDetailsEnabled'
import { useValidatorWarnings } from 'hooks/useValidatorWarnings'
import { ValidatorListInner } from 'library/ValidatorList'
import { useValidatorDetails } from 'library/ValidatorList/useValidatorDetails'
import { Subheading } from 'pages/Nominate/Wrappers'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from 'ui-app/Card'
import { Main } from 'ui-core/canvas'
import { Connect } from './Connect'
import { ListControls } from './Controls/ListControls'
import { MenuSurfaceContext } from './Controls/MenuPopover'
import { RemoveSelected } from './Controls/RemoveSelected'
import { Methods } from './Methods'
import { NominationHealth } from './NominationHealth'
import type { NominationsViewProps } from './types'
import { useAllValidatorsWaiting } from './useAllValidatorsWaiting'
import {
	CloudStartButton,
	EmptyNominations,
	NominationEditorWrapper,
	NominationsLoader,
	StandaloneCards,
	StandalonePreloader,
} from './Wrappers'

export const NominationsView = ({
	cloudValidatorHandler,
	canManageNominations,
	displayFor,
	eligibilityLoading,
	filterHandlers,
	ineligibleStatus = 'notStaking',
	menuControls,
	selectionActionTarget,
	selectHandler,
	standaloneCards,
}: NominationsViewProps) => {
	// Resolve shared application state before deriving view conditions.
	const { t } = useTranslation()
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
	const { isReady } = useApi()
	const { network } = useNetwork()
	const validatorDetailsEnabled = useValidatorDetailsEnabled()
	const { active: healthCheckActive } = useNominationHealth()
	const { activeAddress } = useActiveAccount()
	const { accountsInitialised, isReadOnlyAccount } = useImportedAccounts()

	// Derive layout and visibility once for use across both presentation modes.
	const listReady = isReady && method !== null

	// Use rows for enhanced validator details.
	const listFormat = validatorDetailsEnabled ? 'row' : 'col'

	// Show method selection until a method is chosen.
	const showMethodSelection = !isReadOnlyAccount(activeAddress) && !method

	// Keep validator controls available for every nomination workflow.
	const showValidatorControls =
		canManageNominations &&
		!eligibilityLoading &&
		listReady &&
		(!standaloneCards || Boolean(activeAddress))
	const showEmptyNominations =
		nominations.length === 0 && canManageNominations && !eligibilityLoading

	// Load validator metrics only when the settled nomination list can use them.
	const validatorAddresses = nominations.map(({ address }) => address)
	const validatorDetails = useValidatorDetails(
		validatorAddresses,
		validatorDetailsEnabled && listReady && !fetching,
	)
	const validatorWarnings = useValidatorWarnings(
		network,
		validatorAddresses,
		healthCheckActive && listReady && !fetching,
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

	// The menu, header action and validator list share one selection provider.
	const controls = menuControls(
		showValidatorControls ? (
			<ListControls disabled={fetching} filterHandlers={filterHandlers} />
		) : null,
	)

	// Health output moves into the card in standalone mode without changing data.
	const nominationHealth = healthCheckActive ? (
		<NominationHealth
			allValidatorsWaiting={allValidatorsWaiting}
			isLoading={validatorDetails.isLoading || validatorWarnings.isLoading}
			retainmentByAddress={validatorDetails.retainmentByAddress}
			standalone={standaloneCards}
			validators={nominations}
			warnings={validatorWarnings.warnings}
		/>
	) : null

	// Render the loader and validator list within the same measured container.
	const nominationsList = listReady && (
		<div ref={heightRef}>
			{fetching ? (
				loading
			) : showEmptyNominations && cloudValidatorHandler ? (
				<>
					{nominationHealth}
					<EmptyNominations>
						<h4>{t('noValidatorsSelected', { ns: 'app' })}</h4>
						<CloudStartButton
							lg
							text={t('startWithCloudValidator', { ns: 'app' })}
							iconLeft={faPlus}
							disabled={cloudValidatorHandler.isDisabled()}
							onClick={cloudValidatorHandler.onClick}
						/>
					</EmptyNominations>
				</>
			) : (
				<ValidatorListInner
					validators={nominations}
					allowListFormat={false}
					displayFor={displayFor}
					highlightRetainmentWarnings={healthCheckActive}
					selectable
					forceListFormat={listFormat === 'col' ? 'col' : undefined}
					BeforeListNode={nominationHealth}
					onRemove={selectHandler.popover.callback}
					validatorDetails={validatorDetails}
					validatorWarnings={validatorWarnings.warnings}
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

	const editor = (
		<NominationEditorWrapper
			style={{
				height: height ? `${height}px` : 'auto',
				marginTop: method && displayFor !== 'canvas' ? '1rem' : 0,
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
	)

	return (
		<MenuSurfaceContext.Provider
			value={
				standaloneCards
					? 'var(--nomination-standalone-menu-surface)'
					: 'var(--nomination-menu-surface)'
			}
		>
			<ListProvider selectable initialListFormat={listFormat}>
				{showValidatorControls && (
					<RemoveSelected
						disabled={fetching}
						selectHandler={selectHandler}
						target={selectionActionTarget}
					/>
				)}
				{standaloneCards ? (
					<StandaloneCards>
						<CardWrapper className="transparent">{controls}</CardWrapper>
						{standaloneList}
					</StandaloneCards>
				) : (
					<>
						{controls}
						{displayFor === 'canvas' ? (
							<Main size="xl" withMenu style={{ paddingTop: '0.75rem' }}>
								{editor}
							</Main>
						) : (
							editor
						)}
					</>
				)}
			</ListProvider>
		</MenuSurfaceContext.Provider>
	)
}
