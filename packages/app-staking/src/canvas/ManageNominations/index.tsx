// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ManageNominationsProvider } from 'contexts/ManageNominations'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActivePool } from 'hooks/useActivePool'
import {
	NominationHeading,
	SelectionActionTarget,
} from 'library/GenerateNominations/Wrappers'
import { Editor } from 'library/ManageNominations/Editor'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HeadFullWidth, Title } from 'ui-core/canvas'
import { CloseCanvas, useOverlay } from 'ui-overlay'
import { Settings } from './Settings'

export const Inner = () => {
	const { t } = useTranslation('app')
	const {
		closeCanvas,
		config: { options },
	} = useOverlay().canvas
	const { activePool } = useActivePool()
	const { updatePoolNominations } = useBondedPools()
	const [selectionActionTarget, setSelectionActionTarget] =
		useState<HTMLDivElement | null>(null)

	const isPool = options?.bondFor === 'pool'

	return (
		<>
			<HeadFullWidth
				style={{ paddingTop: '1.75rem', paddingBottom: '1.25rem' }}
			>
				<NominationHeading>
					<Title fullWidth>
						<h1>{t('manageNominations', { ns: 'modals' })}</h1>
					</Title>
					<SelectionActionTarget ref={setSelectionActionTarget} />
				</NominationHeading>
				<Settings />
				<CloseCanvas />
			</HeadFullWidth>
			<Editor
				bondFor={isPool ? 'pool' : 'nominator'}
				displayFor="canvas"
				poolId={activePool?.id}
				selectionActionTarget={selectionActionTarget}
				callbackSubmit={closeCanvas}
				callbackInBlock={(nominationAddresses) => {
					if (isPool && activePool) {
						updatePoolNominations(activePool.id, nominationAddresses)
					}
				}}
			/>
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
