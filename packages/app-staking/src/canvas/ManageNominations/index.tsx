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
import { usePlugins } from 'hooks/usePlugins'
import { useTheme } from 'hooks/useTheme'
import { GenerateNominations } from 'library/GenerateNominations'
import { InlineControls } from 'library/GenerateNominations/Controls/InlineControls'
import { MenuControls } from 'library/GenerateNominations/Controls/MenuControls'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import type { DisplayFor, NominationSelection } from 'types'
import { ButtonSubmit } from 'ui-buttons'
import { HeadFullWidth, Main, Title } from 'ui-core/canvas'
import { Popover } from 'ui-core/popover'
import { CloseCanvas, useOverlay } from 'ui-overlay'
import { Form } from './Form'
import { Settings } from './Settings'

export const Inner = () => {
	const { t } = useTranslation('app')
	const {
		closeCanvas,
		config: { options },
	} = useOverlay().canvas
	const { serviceApi } = useApi()
	const { pluginEnabled } = usePlugins()
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
	const [submitOpen, setSubmitOpen] = useState<boolean>(false)

	// Health check states
	const [hasDangerWarnings, setHasDangerWarnings] = useState<boolean>(false)
	const [healthCheckFixing, setHealthCheckFixing] = useState<boolean>(false)
	const [healthCheckFixRequest, setHealthCheckFixRequest] = useState(0)
	const [healthCheckEnabled, setHealthCheckEnabled] = useState(true)
	const stakingApiEnabled = pluginEnabled('staking_api')
	const healthCheckActive = stakingApiEnabled && healthCheckEnabled

	const toggleHealthCheck = (enabled: boolean) => {
		setHealthCheckEnabled(enabled)
		if (!enabled) {
			setHasDangerWarnings(false)
		}
	}

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
	const hasSubmittableChanges =
		MaxNominations >= nominations.length &&
		nominations.length > 0 &&
		!nominationsMatch()
	const valid =
		hasSubmittableChanges && (!healthCheckActive || !hasDangerWarnings)

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

	useEffect(() => {
		if (!valid) {
			setSubmitOpen(false)
		}
	}, [valid])

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
				{stakingApiEnabled && (
					<Settings
						disabled={healthCheckFixing}
						healthCheckEnabled={healthCheckEnabled}
						onHealthCheckEnabledChange={toggleHealthCheck}
					/>
				)}
				<CloseCanvas />
			</HeadFullWidth>
			{displayFor === 'canvas' && (
				<MenuControls
					allowRevert={allowRevert}
					setters={setters}
					action={
						method ? (
							healthCheckActive && hasDangerWarnings ? (
								<ButtonSubmit
									lg
									text={t('fixIssues')}
									disabled={healthCheckFixing}
									onClick={() =>
										setHealthCheckFixRequest((current) => current + 1)
									}
								/>
							) : (
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
										<Form
											valid={valid}
											requiresMigratedController={!isPool}
											submitExtrinsic={submitExtrinsic}
										/>
									}
								>
									<ButtonSubmit
										asLabel
										lg
										text={t('submit', { ns: 'modals' })}
										pulse={valid}
										disabled={!valid}
									/>
								</Popover>
							)
						) : undefined
					}
				/>
			)}
			<Main size={canvasSize} withMenu>
				{displayFor !== 'canvas' && <InlineControls displayFor={displayFor} />}
				<GenerateNominations
					displayFor={displayFor}
					healthCheckEnabled={healthCheckActive}
					healthCheckFixRequest={healthCheckFixRequest}
					onHealthCheckDangerChange={setHasDangerWarnings}
					onHealthCheckFixingChange={setHealthCheckFixing}
					setters={setters}
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
