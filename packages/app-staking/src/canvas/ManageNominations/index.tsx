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
import { useTheme } from 'hooks/useTheme'
import { GenerateNominations } from 'library/GenerateNominations'
import { InlineControls } from 'library/GenerateNominations/Controls/InlineControls'
import { MenuControls } from 'library/GenerateNominations/Controls/MenuControls'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import type { DisplayFor, NominationSelection } from 'types'
import { SubmitTx } from 'ui-app/SubmitTx'
import { ButtonSubmit } from 'ui-buttons'
import { HeadFullWidth, Main, Title } from 'ui-core/canvas'
import { Popover } from 'ui-core/popover'
import { CloseCanvas, useOverlay } from 'ui-overlay'
import { NominationSummary, SubmitTxContainer } from './Wrappers'

export const Inner = () => {
	const { t } = useTranslation('app')
	const {
		closeCanvas,
		config: { options },
	} = useOverlay().canvas
	const { serviceApi } = useApi()
	const { activePool } = useActivePool()
	const { activeProxy } = useActiveProxy()
	const { activeAccount } = useActiveAccount()
	const { themeElementRef } = useTheme()
	const { updatePoolNominations } = useBondedPools()
	const { defaultNominations, nominations, setNominations, method } =
		useManageNominations()

	const bondFor = options?.bondFor || 'nominator'
	const isPool = bondFor === 'pool'

	// Whether to display revert changes button
	const allowRevert = !!method

	// Canvas content size
	const canvasSize = 'xl'

	// Valid to submit transaction
	const [valid, setValid] = useState<boolean>(false)
	const [submitOpen, setSubmitOpen] = useState<boolean>(false)

	// Handler for updating setup
	const handleSetupUpdate = (value: NominationSelection) => {
		setNominations(value.nominations)
	}

	// Check if default nominations match new ones
	const nominationsMatch = () =>
		nominations.every((n) =>
			defaultNominations.find((d) => d.address === n.address),
		) &&
		nominations.length > 0 &&
		nominations.length === defaultNominations.length

	const defaultNominationAddresses = new Set(
		defaultNominations.map(({ address }) => address),
	)
	const nominationAddresses = new Set(nominations.map(({ address }) => address))
	const addedNominations = nominations.filter(
		({ address }) => !defaultNominationAddresses.has(address),
	).length
	const removedNominations = defaultNominations.filter(
		({ address }) => !nominationAddresses.has(address),
	).length
	const nominationCountLabel = (count: number) =>
		count === 0
			? t('none', { ns: 'pages' })
			: `${count} ${t('nominations', { count })}`

	const getTx = () => {
		if (!valid) {
			return
		}
		if (!isPool) {
			return serviceApi.tx.stakingNominate(
				nominations.map((nominee) => nominee.address),
			)
		}
		if (isPool && activePool) {
			return serviceApi.tx.poolNominate(
				activePool.id,
				nominations.map((nominee) => nominee.address),
			)
		}
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: valid,
		callbackSubmit: () => {
			closeCanvas()
		},
		callbackInBlock: () => {
			if (isPool && activePool) {
				// Update bonded pool targets if updating pool nominations
				updatePoolNominations(
					activePool.id,
					nominations.map((n) => n.address),
				)
			}
		},
	})

	// Valid if there are between 1 and `MaxNominations` nominations
	useEffect(() => {
		const nextValid =
			MaxNominations >= nominations.length &&
			nominations.length > 0 &&
			!nominationsMatch()

		setValid(nextValid)
		if (!nextValid) {
			setSubmitOpen(false)
		}
	}, [nominations])

	// Generation component props
	const displayFor: DisplayFor = 'canvas'
	const setters = [
		{
			current: {
				callable: true,
				fn: () => nominations,
			},
			set: handleSetupUpdate,
		},
	]

	return (
		<>
			<HeadFullWidth>
				<Title fullWidth>
					<h1>{t('manageNominations', { ns: 'modals' })}</h1>
				</Title>
				<CloseCanvas />
			</HeadFullWidth>
			{displayFor === 'canvas' && (
				<MenuControls
					allowRevert={allowRevert}
					setters={setters}
					action={
						<Popover
							open={submitOpen}
							onOpenChange={setSubmitOpen}
							disabled={!valid}
							portalContainer={themeElementRef.current || undefined}
							width="min(380px, calc(100vw - 2rem))"
							side="bottom"
							align="end"
							sideOffset={8}
							content={
								<>
									<NominationSummary>
										<h3>{t('summary', { ns: 'pages' })}</h3>
										<div className="row">
											<span>{t('nominationsAdded')}</span>
											<span>{nominationCountLabel(addedNominations)}</span>
										</div>
										<div className="row">
											<span>{t('nominationsRemoved')}</span>
											<span>{nominationCountLabel(removedNominations)}</span>
										</div>
										<div className="row total">
											<span>{t('totalNominations')}:</span>
											<span>{nominations.length}</span>
										</div>
									</NominationSummary>
									<SubmitTxContainer>
										<SubmitTx
											noMargin
											requiresMigratedController={!isPool}
											valid={valid}
											displayFor="card"
											stacked
											transparent
											hideSigner
											{...submitExtrinsic}
										/>
									</SubmitTxContainer>
								</>
							}
						>
							<ButtonSubmit
								asLabel
								text={t('submit', { ns: 'modals' })}
								disabled={!valid}
							/>
						</Popover>
					}
				/>
			)}
			<Main size={canvasSize} withMenu>
				{displayFor !== 'canvas' && (
					<InlineControls
						displayFor={displayFor}
						allowRevert={allowRevert}
						setters={setters}
					/>
				)}
				<GenerateNominations
					displayFor={displayFor}
					setters={setters}
					allowRevert={allowRevert}
				/>
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
