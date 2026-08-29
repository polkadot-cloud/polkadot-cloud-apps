// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowDownWideShort,
	faBolt,
	faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaxNominations } from 'consts'
import { PolkadotCloudValidatorAddresses } from 'consts/validators'
import { useEraStakers } from 'contexts/EraStakers'
import { useManageNominations } from 'contexts/ManageNominations'
import { useNetwork } from 'hooks/useNetwork'
import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import { useSyncing } from 'hooks/useSyncing'
import { useTheme } from 'hooks/useTheme'
import { useValidatorDetails } from 'library/ValidatorList/useValidatorDetails'
import {
	fetchTrustedWaitingValidators,
	useOperatorList,
} from 'plugin-staking-api'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { ButtonMenu } from 'ui-buttons'
import { ConnectItem, Popover } from 'ui-core/popover'
import classes from './Optimise.module.scss'

const TARGET_ACTIVE_VALIDATORS = 5
const TARGET_WAITING_VALIDATORS = 2
const [POLKADOT_CLOUD_ONE, POLKADOT_CLOUD_TWO] = PolkadotCloudValidatorAddresses

const getRetainmentRate = (
	address: string,
	retainmentByAddress: ReturnType<
		typeof useValidatorDetails
	>['retainmentByAddress'],
) => {
	const rate = retainmentByAddress.get(address)?.months[0]?.retainmentRate
	return typeof rate === 'number' && Number.isFinite(rate)
		? rate
		: Number.POSITIVE_INFINITY
}

export const Optimise = () => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { themeElementRef } = useTheme()
	const retainmentStatsEnabled = useRetainmentStatsEnabled()
	const { syncing } = useSyncing(['era-stakers'])
	const {
		eraStakers: { stakers },
	} = useEraStakers()
	const { nominations, setNominations } = useManageNominations()
	const [open, setOpen] = useState(false)
	const [addingWaiting, setAddingWaiting] = useState(false)

	const activeAddresses = useMemo(
		() => new Set(stakers.map(({ address }) => address)),
		[stakers],
	)
	const { activeValidators, waitingValidators } = useMemo(
		() => ({
			activeValidators: nominations.filter(({ address }) =>
				activeAddresses.has(address),
			),
			waitingValidators: nominations.filter(
				({ address }) => !activeAddresses.has(address),
			),
		}),
		[activeAddresses, nominations],
	)
	const activeRemovalCount = syncing
		? 0
		: Math.max(activeValidators.length - TARGET_ACTIVE_VALIDATORS, 0)
	const waitingAdditionCount =
		!syncing && activeValidators.length
			? Math.max(TARGET_WAITING_VALIDATORS - waitingValidators.length, 0)
			: 0
	const availableNominationSlots = Math.max(
		MaxNominations - nominations.length,
		0,
	)
	const waitingCandidatesToAdd = Math.min(
		waitingAdditionCount,
		availableNominationSlots,
	)

	const validatorDetails = useValidatorDetails(
		activeValidators.map(({ address }) => address),
		retainmentStatsEnabled && activeRemovalCount > 0,
	)
	const { data: operatorListData, loading: operatorListLoading } =
		useOperatorList(
			{
				network,
				order: 'RETAINMENT_HIGH',
				pageSize: 50,
			},
			{
				skip:
					!retainmentStatsEnabled ||
					waitingAdditionCount === 0 ||
					availableNominationSlots === 0,
			},
		)
	const operatorRankByAddress = useMemo(
		() =>
			new Map(
				operatorListData.operatorList.operators.flatMap((operator, rank) =>
					operator.validators.map((address) => [address, rank] as const),
				),
			),
		[operatorListData],
	)

	const removeLowestRetainers = () => {
		if (activeRemovalCount === 0 || validatorDetails.isLoading) return

		const addressesToRemove = new Set(
			[...activeValidators]
				.sort(
					(a, b) =>
						getRetainmentRate(a.address, validatorDetails.retainmentByAddress) -
						getRetainmentRate(b.address, validatorDetails.retainmentByAddress),
				)
				.slice(0, activeRemovalCount)
				.map(({ address }) => address),
		)
		setNominations(
			nominations.filter(({ address }) => !addressesToRemove.has(address)),
		)
		setOpen(false)
	}

	const addTrustedWaitingValidators = async () => {
		if (waitingCandidatesToAdd === 0 || addingWaiting || operatorListLoading) {
			return
		}

		setAddingWaiting(true)
		try {
			const trustedActiveValidators = [...activeValidators].sort((a, b) => {
				// Cloud 1 is the strongest trust seed for selecting Cloud 2.
				if (a.address === POLKADOT_CLOUD_ONE) return -1
				if (b.address === POLKADOT_CLOUD_ONE) return 1

				const rankA =
					operatorRankByAddress.get(a.address) ?? Number.POSITIVE_INFINITY
				const rankB =
					operatorRankByAddress.get(b.address) ?? Number.POSITIVE_INFINITY
				return rankA - rankB
			})
			const cloudOneActive = trustedActiveValidators.some(
				({ address }) => address === POLKADOT_CLOUD_ONE,
			)
			const nominatedAddresses = new Set(
				nominations.map(({ address }) => address),
			)
			const waitingCandidates: Validator[] = []

			for (const { address: trustedAddress } of trustedActiveValidators) {
				const remaining = waitingCandidatesToAdd - waitingCandidates.length
				if (remaining === 0) break

				const result = await fetchTrustedWaitingValidators({
					network,
					addresses: [trustedAddress],
					count: remaining,
				})
				const candidates = [...result.fetchTrustedWaitingValidators].sort(
					(a, b) =>
						cloudOneActive
							? Number(b.address === POLKADOT_CLOUD_TWO) -
								Number(a.address === POLKADOT_CLOUD_TWO)
							: 0,
				)
				for (const candidate of candidates) {
					if (
						!nominatedAddresses.has(candidate.address) &&
						!waitingCandidates.some(
							({ address }) => address === candidate.address,
						)
					) {
						waitingCandidates.push(candidate)
					}
					if (waitingCandidates.length === waitingCandidatesToAdd) break
				}
			}

			setNominations(nominations.concat(waitingCandidates))
			setOpen(false)
		} finally {
			setAddingWaiting(false)
		}
	}

	if (!retainmentStatsEnabled) return null

	const removeDisabled = activeRemovalCount === 0 || validatorDetails.isLoading
	const addDisabled =
		waitingCandidatesToAdd === 0 || addingWaiting || operatorListLoading

	return (
		<Popover
			align="start"
			content={
				<ConnectItem.Container>
					<div className={classes.options}>
						<button
							className={classes.option}
							disabled={removeDisabled}
							onClick={removeLowestRetainers}
							type="button"
						>
							<span className={classes.icon}>
								<FontAwesomeIcon aria-hidden icon={faArrowDownWideShort} />
							</span>
							<span className={classes.copy}>
								<span className={classes.title}>
									{t('removeLowestRetainers')}
								</span>
								<span className={classes.subtitle}>
									{t('removeLowestRetainersSubtitle')}
								</span>
							</span>
						</button>
						<button
							className={classes.option}
							disabled={addDisabled}
							onClick={() => void addTrustedWaitingValidators()}
							type="button"
						>
							<span className={classes.icon}>
								<FontAwesomeIcon aria-hidden icon={faShieldHalved} />
							</span>
							<span className={classes.copy}>
								<span className={classes.title}>
									{t('addTrustedWaitingValidators')}
								</span>
								<span className={classes.subtitle}>
									{t('addTrustedWaitingValidatorsSubtitle')}
								</span>
							</span>
						</button>
					</div>
				</ConnectItem.Container>
			}
			onOpenChange={setOpen}
			open={open}
			portalContainer={themeElementRef.current || undefined}
			side="bottom"
			sideOffset={8}
			triggerLabel={t('optimise')}
			width="min(380px, calc(100vw - 2rem))"
		>
			<ButtonMenu asLabel iconLeft={faBolt} text={t('optimise')} />
		</Popover>
	)
}
