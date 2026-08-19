// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ManageNominationsProvider } from 'contexts/ManageNominations'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActivePool } from 'hooks/useActivePool'
import { Editor } from 'library/ManageNominations/Editor'
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

	const isPool = options?.bondFor === 'pool'

	return (
		<>
			<HeadFullWidth>
				<Title fullWidth>
					<h1>{t('manageNominations', { ns: 'modals' })}</h1>
				</Title>
				<Settings />
				<CloseCanvas />
			</HeadFullWidth>
			<Editor
				bondFor={isPool ? 'pool' : 'nominator'}
				displayFor="canvas"
				poolId={activePool?.id}
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
