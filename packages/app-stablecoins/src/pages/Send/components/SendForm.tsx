// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@w3ux/utils'
import { BalanceInputMulti } from 'ui-app/BalanceInput'
import { Dropdown } from 'ui-app/Dropdown'
import { Page } from 'ui-core/base'
import { SendForm as SendFormUi } from 'ui-core/input'
import { AccountFields } from './AccountFields'
import { FeePaymentFields } from './FeePaymentFields'
import type { SendFormProps } from './types'

export const SendForm = ({
	accounts,
	selection,
	transaction,
}: SendFormProps) => (
	<Page.Row>
		<SendFormUi.Container>
			<SendFormUi.Header
				title="Send Assets"
				subtitle="Transfer stablecoins to another address on the same network."
			/>
			<SendFormUi.Card>
				<SendFormUi.Segment title="Chain" layer="top">
					<Dropdown
						options={selection.chainOptions}
						selected={selection.selectedChain}
						onSelect={selection.setSelectedChain}
						variant="full"
					/>
				</SendFormUi.Segment>
				<AccountFields
					accounts={accounts.accounts}
					accountsWithSigners={accounts.accountsWithSigners}
					fromAccount={accounts.fromAccount}
					onFromSelect={accounts.setFromAccount}
					onToSelect={accounts.setToAccount}
					toAccount={accounts.toAccount}
				/>
				<BalanceInputMulti
					label="Asset to Send"
					value={selection.amount}
					onChange={selection.setAmount}
					maxAvailable={planckToUnit(
						transaction.maxAvailableToSend,
						transaction.selectedDecimals,
					)}
					maxDecimals={transaction.selectedDecimals}
					syncing={transaction.balancesLoading}
					options={selection.tokenOptions}
					selected={selection.selectedToken}
					onSelect={selection.setSelectedToken}
					ariaLabel="Amount to send"
				/>
				<FeePaymentFields
					balancesLoading={transaction.balancesLoading}
					feeAssetOptions={selection.availableFeeAssetOptions}
					feeBalance={transaction.selectedFeeAssetBalance}
					feeDisplay={transaction.feeDisplay}
					feeSetupRequired={transaction.feeSetupRequired}
					onSelect={selection.setSelectedFeeAsset}
					selectedFeeAsset={selection.selectedFeeAsset}
					submission={transaction.submission}
					submitText={transaction.submitText}
					valid={transaction.valid}
				/>
			</SendFormUi.Card>
		</SendFormUi.Container>
	</Page.Row>
)
