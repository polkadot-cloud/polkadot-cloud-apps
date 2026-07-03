// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import type { FetchedPoolMember } from 'hooks/usePoolMembers'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { Warning } from 'library/Form/Warning'
import { SubmitTx } from 'library/SubmitTx'
import type { RefObject } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Notes, Padding, Warnings } from 'ui-core/modal'
import { Title } from 'ui-core/prompt'
import { usePrompt } from 'ui-overlay'
import { planckToUnitBn } from 'utils'

export const WithdrawMember = ({
	who,
	member,
	memberRef,
}: {
	who: string
	member: FetchedPoolMember
	memberRef: RefObject<HTMLDivElement | null>
}) => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { serviceApi } = useApi()
	const { closePrompt } = usePrompt()
	const { activeProxy } = useActiveProxy()
	const { getConsts, activeEra } = useApi()
	const { activeAccount } = useActiveAccount()
	const { getSignerWarnings } = useSignerWarnings()
	const { unit, units } = getStakingChainData(network)
	const { historyDepth } = getConsts(network)
	const { unbondingEras } = member

	// calculate total for withdraw
	let totalWithdrawUnit = new BigNumber(0)

	unbondingEras.forEach(([era, amount]) => {
		if (activeEra.index > Number(era)) {
			totalWithdrawUnit = totalWithdrawUnit.plus(new BigNumber(amount))
		}
	})

	const totalWithdraw = planckToUnitBn(new BigNumber(totalWithdrawUnit), units)

	// valid to submit transaction
	const [valid] = useState<boolean>(!totalWithdraw.isZero())

	const getTx = () => {
		if (!valid) {
			return
		}
		return serviceApi.tx.poolWithdraw(who, historyDepth)
	}
	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: valid,
		callbackSubmit: () => {
			// Remove the pool member from member list
			memberRef.current?.remove()
			closePrompt()
		},
	})

	const warnings = getSignerWarnings(
		activeAccount,
		false,
		submitExtrinsic.proxySupported,
	)

	return (
		<>
			<Title title={t('withdrawPoolMember')} onClose={closePrompt} />
			<Padding>
				{warnings.length > 0 ? (
					<Warnings>
						{warnings.map((text) => (
							<Warning key={`warning_${text}`} text={text} />
						))}
					</Warnings>
				) : null}

				<h3 style={{ display: 'flex', alignItems: 'center' }}>
					<Polkicon address={who} transform="grow-3" />
					&nbsp; {ellipsisFn(who, 7)}
				</h3>

				<Notes>
					<p>
						<p>
							{t('amountWillBeWithdrawn', {
								bond: totalWithdraw.toString(),
								unit,
							})}
						</p>{' '}
					</p>
					<p>{t('withdrawRemoveNote')}</p>
				</Notes>
			</Padding>
			<SubmitTx
				submitText={t('withdraw', { ns: 'modals' })}
				valid={valid}
				{...submitExtrinsic}
			/>
		</>
	)
}
