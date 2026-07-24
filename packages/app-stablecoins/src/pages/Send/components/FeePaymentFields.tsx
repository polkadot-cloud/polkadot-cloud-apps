// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { Dropdown } from 'ui-app/Dropdown'
import { EstimatedTxFee } from 'ui-app/EstimatedTxFee'
import { SubmitTx } from 'ui-app/SubmitTx'
import { SendForm } from 'ui-core/input'
import { formatBalance } from '../utils'
import type { FeePaymentFieldsProps } from './types'

export const FeePaymentFields = ({
	balancesLoading,
	feeAssetOptions,
	feeBalance,
	feeDisplay,
	feeSetupRequired,
	onSelect,
	selectedFeeAsset,
	submission,
	submitText,
	valid,
}: FeePaymentFieldsProps) => {
	const { t } = useTranslation('app')

	return (
		<>
			<SendForm.Segment
				title={t('stablecoins.payFeesIn')}
				headerContent={
					<SendForm.Label label={t('stablecoins.available')}>
						{balancesLoading
							? '...'
							: formatBalance(feeBalance, selectedFeeAsset.value)}
					</SendForm.Label>
				}
			>
				<Dropdown
					options={feeAssetOptions}
					selected={selectedFeeAsset}
					onSelect={onSelect}
					variant="full"
				/>
			</SendForm.Segment>
			<SendForm.Notes>
				<SendForm.Note label={t('stablecoins.networkFee')}>
					<EstimatedTxFee uid={submission.uid} feeDisplay={feeDisplay} />
				</SendForm.Note>
				{feeSetupRequired && (
					<SendForm.Note label={t('stablecoins.feeToken')} variant="success">
						{t('stablecoins.setFeeTokenBeforeSending', {
							symbol: selectedFeeAsset.value,
						})}
					</SendForm.Note>
				)}
			</SendForm.Notes>
			<SendForm.Action>
				<SubmitTx
					{...submission}
					submitText={submitText}
					valid={valid}
					noMargin
					feeDisplay={feeDisplay}
					feeBalance={feeBalance?.free ?? 0n}
					hideSigner
					transparent
				/>
			</SendForm.Action>
		</>
	)
}
