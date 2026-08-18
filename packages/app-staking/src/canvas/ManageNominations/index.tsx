// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { MaxNominations } from 'consts'
import {
	ManageNominationsProvider,
	useManageNominations,
} from 'contexts/ManageNominations'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { GenerateNominations } from 'library/GenerateNominations'
import { MenuControls } from 'library/GenerateNominations/Controls/MenuControls'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import type { NominationSelection } from 'types'
import { HeadFullWidth, Main, Title } from 'ui-core/canvas'
import { CloseCanvas, useOverlay } from 'ui-overlay'
import { MenuAction } from './MenuAction'
import { Settings } from './Settings'

export const Inner = () => {
	const { t } = useTranslation('app')
	const {
		closeCanvas,
		config: { options },
	} = useOverlay().canvas
	const { serviceApi } = useApi()
	const {
		active: healthCheckActive,
		hasDangerWarnings,
		isLoading: healthCheckLoading,
	} = useNominationHealth()
	const { activePool } = useActivePool()
	const { activeProxy } = useActiveProxy()
	const { activeAccount } = useActiveAccount()
	const { updatePoolNominations } = useBondedPools()
	const { defaultNominations, nominations, setNominations, method } =
		useManageNominations()

	const isPool = options?.bondFor === 'pool'

	// Check if default nominations match new ones
	const nominationsMatch =
		nominations.length === defaultNominations.length &&
		nominations.every(({ address }) =>
			defaultNominations.some((nomination) => nomination.address === address),
		)

	// Whether the current nominations contain submittable changes
	const hasSubmittableChanges =
		MaxNominations >= nominations.length &&
		nominations.length > 0 &&
		!nominationsMatch

	// Whether the current nominations can be submitted
	const valid =
		hasSubmittableChanges &&
		(!healthCheckActive || (!healthCheckLoading && !hasDangerWarnings))

	// Addresses of the current nominations
	const nominationAddresses = nominations.map(({ address }) => address)

	const getTx = () => {
		if (!valid) {
			return
		}
		if (!isPool) {
			return serviceApi.tx.stakingNominate(nominationAddresses)
		}
		if (isPool && activePool) {
			return serviceApi.tx.poolNominate(activePool.id, nominationAddresses)
		}
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: valid,
		callbackSubmit: closeCanvas,
		callbackInBlock: () => {
			if (isPool && activePool) {
				// Update bonded pool targets if updating pool nominations
				updatePoolNominations(activePool.id, nominationAddresses)
			}
		},
	})

	// Setter configuration for synchronizing generated nominations
	const setters = [
		{
			current: {
				callable: true,
				fn: () => nominations,
			},
			set: ({ nominations: nextNominations }: NominationSelection) =>
				setNominations(nextNominations),
		},
	]

	return (
		<>
			<HeadFullWidth>
				<Title fullWidth>
					<h1>{t('manageNominations', { ns: 'modals' })}</h1>
				</Title>
				<Settings />
				<CloseCanvas />
			</HeadFullWidth>
			<MenuControls
				allowRevert={Boolean(method)}
				setters={setters}
				action={
					method ? (
						<MenuAction
							isPool={isPool}
							submitExtrinsic={submitExtrinsic}
							valid={valid}
						/>
					) : undefined
				}
			/>
			<Main size="xl" withMenu>
				<GenerateNominations displayFor="canvas" setters={setters} />
			</Main>
		</>
	)
}

export const ManageNominations = () => {
	const {
		config: { options },
	} = useOverlay().canvas

	return (
		<ManageNominationsProvider nominations={options?.nominated || []}>
			<Inner />
		</ManageNominationsProvider>
	)
}
