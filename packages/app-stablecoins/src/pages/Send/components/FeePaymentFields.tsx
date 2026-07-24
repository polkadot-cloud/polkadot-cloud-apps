// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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
}: FeePaymentFieldsProps) => (
	<>
		<SendForm.Segment
			title="Pay Fees In"
			headerContent={
				<SendForm.Label label="Available">
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
			<SendForm.Note label="Network Fee">
				<EstimatedTxFee uid={submission.uid} feeDisplay={feeDisplay} />
			</SendForm.Note>
			{feeSetupRequired && (
				<SendForm.Note label="Fee Token" variant="success">
					Set {selectedFeeAsset.value} before sending
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
