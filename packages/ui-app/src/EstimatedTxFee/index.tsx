// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { useTxMeta } from 'hooks/useTxMeta'
import { useTranslation } from 'react-i18next'
import { planckToUnitBn } from 'utils'
import type { EstimatedTxFeeProps } from './types'

export const EstimatedTxFee = ({ uid, feeDisplay }: EstimatedTxFeeProps) => {
	const { t } = useTranslation('app')
	const { getTxSubmission } = useTxMeta()
	const { unit, units } = feeDisplay

	const txSubmission = getTxSubmission(uid)
	const fee = txSubmission?.fee || 0n

	const txFeesUnit = planckToUnitBn(new BigNumber(fee), units).toFormat()

	return (
		<>
			{t('fee')}: {fee === 0n ? '...' : `~${txFeesUnit} ${unit}`}
		</>
	)
}
