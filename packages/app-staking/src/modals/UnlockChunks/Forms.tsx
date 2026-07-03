// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useFavoritePools } from 'hooks/useFavoritePools'
import { useNetwork } from 'hooks/useNetwork'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { ActionItem } from 'library/ActionItem'
import { Warning } from 'library/Form/Warning'
import { ModalBack } from 'library/ModalBack'
import { SubmitTx } from 'library/SubmitTx'
import { type ForwardedRef, forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Padding, Warnings } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import type { FormsProps } from './types'
import { ContentWrapper } from './Wrappers'

export const Forms = forwardRef(
	(
		{
			setSection,
			unlock,
			task,
			incrementCalculateHeight,
			onResize,
		}: FormsProps,
		ref: ForwardedRef<HTMLDivElement>,
	) => {
		const { t } = useTranslation('modals')
		const {
			closeModal,
			config: { options },
		} = useOverlay().modal
		const { network } = useNetwork()
		const { activePool } = useActivePool()
		const { activeProxy } = useActiveProxy()
		const { getConsts, serviceApi } = useApi()
		const { getSignerWarnings } = useSignerWarnings()
		const { removeFromBondedPools } = useBondedPools()
		const { activeAddress, activeAccount } = useActiveAccount()
		const { removeFavorite: removeFavoritePool } = useFavoritePools()

		const { unit, units } = getStakingChainData(network)
		const { bondFor, poolClosure } = options || {}
		const { historyDepth } = getConsts(network)

		const isStaking = bondFor === 'nominator'
		const isPooling = bondFor === 'pool'

		// valid to submit transaction
		const [valid, setValid] = useState<boolean>(
			(unlock?.value || 0n) > 0 || false,
		)

		const getTx = () => {
			if (!valid || !unlock) {
				return
			}
			if (task === 'rebond' && isStaking) {
				return serviceApi.tx.stakingRebond(unlock.value || 0n)
			}
			if (task === 'withdraw' && isStaking) {
				return serviceApi.tx.stakingWithdraw(historyDepth)
			}
			if (task === 'withdraw' && isPooling && activePool) {
				if (activeAddress) {
					return serviceApi.tx.poolWithdraw(activeAddress, historyDepth)
				}
			}
			return
		}

		const submitExtrinsic = useSubmitExtrinsic({
			tx: getTx(),
			from: formatFromProp(activeAccount, activeProxy),
			shouldSubmit: valid,
			callbackSubmit: () => {
				closeModal()
			},
			callbackInBlock: () => {
				// if pool is being closed, remove from static lists
				if (poolClosure) {
					removeFavoritePool(activePool?.addresses?.stash ?? '')
					removeFromBondedPools(activePool?.id ?? 0)
				}
			},
		})

		const value = unlock?.value || 0n
		const warnings = getSignerWarnings(
			activeAccount,
			isStaking,
			submitExtrinsic.proxySupported,
		)

		// Ensure unlock value is valid.
		useEffect(() => {
			setValid((unlock?.value || 0n) > 0 || false)
		}, [unlock])

		// Trigger modal resize when commission options are enabled / disabled.
		useEffect(() => {
			incrementCalculateHeight()
		}, [valid])

		return (
			<ContentWrapper>
				<div ref={ref}>
					<Padding horizontalOnly>
						{warnings.length > 0 ? (
							<Warnings>
								{warnings.map((text) => (
									<Warning key={`warning_${text}`} text={text} />
								))}
							</Warnings>
						) : null}
						<div style={{ marginBottom: '2rem' }}>
							{task === 'rebond' && (
								<>
									<ActionItem
										text={`${t('rebond')} ${new BigNumber(
											planckToUnit(value, units),
										).toFormat()} ${unit}`}
									/>
									<p>{t('rebondSubtitle')}</p>
								</>
							)}
							{task === 'withdraw' && (
								<>
									<ActionItem
										text={`${t('withdraw')} ${new BigNumber(
											planckToUnit(value, units),
										).toFormat()} ${unit}`}
									/>
									<p>{t('withdrawSubtitle')}</p>
								</>
							)}
						</div>
					</Padding>
					<ModalBack onClick={() => setSection(0)} />
					<SubmitTx
						noMargin
						submitText={t(task === 'rebond' ? 'rebond' : 'withdraw', {
							ns: 'modals',
						})}
						requiresMigratedController={isStaking}
						valid={valid}
						{...submitExtrinsic}
						onResize={onResize}
					/>
				</div>
			</ContentWrapper>
		)
	},
)

Forms.displayName = 'Forms'
