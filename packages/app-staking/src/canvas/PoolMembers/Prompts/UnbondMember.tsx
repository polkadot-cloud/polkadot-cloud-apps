// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { getUnixTime } from 'date-fns'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useErasToTimeLeft } from 'hooks/useErasToTimeLeft'
import { useNetwork } from 'hooks/useNetwork'
import type { FetchedPoolMember } from 'hooks/usePoolMembers'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { Warning } from 'library/Form/Warning'
import { SubmitTx } from 'library/SubmitTx'
import { StaticNote } from 'modals/Utils/StaticNote'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Notes, Padding, Warnings } from 'ui-core/modal'
import { Title } from 'ui-core/prompt'
import { usePrompt } from 'ui-overlay'
import { planckToUnitBn, timeleftAsString } from 'utils'

export const UnbondMember = ({
	who,
	member,
}: {
	who: string
	member: FetchedPoolMember
}) => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { closePrompt } = usePrompt()
	const { activeProxy } = useActiveProxy()
	const { getConsts, serviceApi } = useApi()
	const { erasToSeconds } = useErasToTimeLeft()
	const { getSignerWarnings } = useSignerWarnings()
	const { unit, units } = getStakingChainData(network)
	const { activeAddress, activeAccount } = useActiveAccount()

	const { points } = member
	const { bondDuration } = getConsts(network)
	const freeToUnbond = planckToUnitBn(new BigNumber(points), units)
	const bondDurationFormatted = timeleftAsString(
		t,
		getUnixTime(new Date()) + 1,
		erasToSeconds(bondDuration),
		true,
	)

	const [paramsValid, setParamsValid] = useState<boolean>(false)

	useEffect(() => {
		setParamsValid(BigInt(points) > 0)
	}, [freeToUnbond.toString()])

	const getTx = () => {
		if (!activeAddress) {
			return
		}
		return serviceApi.tx.poolUnbond(who, points)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: paramsValid,
		callbackSubmit: () => {
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
			<Title title={t('unbondPoolMember')} onClose={closePrompt} />
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
						{t('amountWillBeUnbonded', { bond: freeToUnbond.toString(), unit })}
					</p>
					<StaticNote
						value={bondDurationFormatted}
						tKey="onceUnbondingPoolMember"
						valueKey="bondDurationFormatted"
						deps={[bondDuration]}
					/>
				</Notes>
			</Padding>
			<SubmitTx
				noMargin
				submitText={t('unbond', { ns: 'modals' })}
				valid={paramsValid}
				{...submitExtrinsic}
			/>
		</>
	)
}
