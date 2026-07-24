// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import type { SubmittableExtrinsic } from 'dedot'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBatchCall } from 'hooks/useBatchCall'
import { useNetwork } from 'hooks/useNetwork'
import { usePayouts } from 'hooks/usePayouts'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { Warning } from 'library/Form/Warning'
import { ModalBack } from 'library/ModalBack'
import type { ForwardedRef } from 'react'
import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import { SubmitTx } from 'ui-app/SubmitTx'
import { ActionItem, Padding, Warnings } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import type { ActivePayout, FormProps } from './types'
import { ContentWrapper } from './Wrappers'

export const Forms = forwardRef(
	(
		{ setSection, payouts, setPayouts, onResize }: FormProps,
		ref: ForwardedRef<HTMLDivElement>,
	) => {
		const { t } = useTranslation('modals')
		const { network } = useNetwork()
		const { serviceApi } = useApi()
		const { newBatchCall } = useBatchCall()
		const { activeProxy } = useActiveProxy()
		const { closeModal } = useOverlay().modal
		const { getSignerWarnings } = useSignerWarnings()
		const { activeAddress, activeAccount } = useActiveAccount()
		const { unclaimedRewards, setUnclaimedRewards } = usePayouts()
		const { unit, units } = getStakingChainData(network)

		// Get the total payout amount
		const totalPayout =
			payouts?.reduce(
				(total: BigNumber, cur: ActivePayout) => total.plus(cur.payout),
				new BigNumber(0),
			) || new BigNumber(0)

		// Get the total number of validators per payout per era
		const totalPayoutValidators =
			payouts?.reduce(
				(prev, { paginatedValidators }) =>
					prev + (paginatedValidators?.length || 0),
				0,
			) || 0

		const [valid, setValid] = useState<boolean>(
			totalPayout.isGreaterThan(0) && totalPayoutValidators > 0,
		)

		const getCalls = () => {
			const calls =
				payouts?.reduce(
					(acc: SubmittableExtrinsic[], { era, paginatedValidators }) => {
						if (!paginatedValidators.length) {
							return acc
						}
						paginatedValidators.forEach(([page, v]) => {
							const tx = serviceApi.tx.payoutStakersByPage(v, Number(era), page)
							if (tx) {
								acc.push(tx)
							}
						})
						return acc
					},
					[],
				) || []
			return calls
		}

		const getTx = () => {
			const calls = getCalls()
			if (!valid || !calls.length) {
				return
			}
			return calls.length === 1
				? calls.pop()
				: newBatchCall(calls, activeAddress, activeProxy)
		}

		const submitExtrinsic = useSubmitExtrinsic({
			tx: getTx(),
			from: formatFromProp(activeAccount, activeProxy),
			shouldSubmit: valid,
			callbackSubmit: () => {
				closeModal()
			},
			callbackInBlock: () => {
				if (payouts && activeAddress) {
					// Deduct unclaimed payout value from state value
					const eraPayouts: string[] = []
					payouts.forEach(({ era }) => {
						eraPayouts.push(String(era))
					})
					const newUnclaimedRewards = {
						total: new BigNumber(unclaimedRewards.total)
							.minus(totalPayout)
							.toString(),
						entries: unclaimedRewards.entries.filter(
							(entry) => !eraPayouts.includes(String(entry.era)),
						),
					}
					setUnclaimedRewards(newUnclaimedRewards)
				}
				// Reset active form payouts for this modal
				setPayouts([])
			},
		})

		const warnings = getSignerWarnings(
			activeAccount,
			false,
			submitExtrinsic.proxySupported,
		)

		// Ensure payouts value is valid
		useEffect(
			() => setValid(totalPayout.isGreaterThan(0) && totalPayoutValidators > 0),
			[payouts],
		)

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
							<ActionItem
								text={`${t('claim')} ${planckToUnit(
									totalPayout.toString(),
									units,
								)} ${unit}`}
							/>
							<p>{t('afterClaiming')}</p>
						</div>
					</Padding>
					<ModalBack onClick={() => setSection(0)} />
					<SubmitTx
						noMargin
						onResize={onResize}
						submitText={t('claim', { ns: 'modals' })}
						valid={valid}
						{...submitExtrinsic}
					/>
				</div>
			</ContentWrapper>
		)
	},
)

Forms.displayName = 'Forms'
