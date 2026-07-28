// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@w3ux/utils'
import { useTranslation } from 'react-i18next'
import { BalanceInputMulti } from 'ui-app/BalanceInput'
import { Dropdown } from 'ui-app/Dropdown'
import { Page } from 'ui-core/base'
import { SendForm as SendFormUi } from 'ui-core/input'
import { isSameAddress } from '../utils'
import { AccountFields } from './AccountFields'
import { FeePaymentFields } from './FeePaymentFields'
import type { SendFormProps } from './types'

export const SendForm = ({
	accounts,
	selection,
	transaction,
}: SendFormProps) => {
	const { t } = useTranslation('swap')
	const handleFromSelect = (account: typeof accounts.fromAccount) => {
		if (isSameAddress(account, accounts.toAccount)) {
			accounts.setToAccount(accounts.fromAccount)
		}
		accounts.setFromAccount(account)
	}
	const handleToSelect = (account: typeof accounts.toAccount) => {
		if (isSameAddress(account, accounts.fromAccount)) {
			accounts.setFromAccount(accounts.toAccount)
		}
		accounts.setToAccount(account)
	}

	return (
		<Page.Row>
			<SendFormUi.Container>
				<SendFormUi.Header
					title={t('sendAssets')}
					subtitle={t('transferAssetsDescription')}
					label="Beta"
				/>
				<SendFormUi.Card>
					<SendFormUi.Segment title={t('chain')} layer="top">
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
						onFromSelect={handleFromSelect}
						onToSelect={handleToSelect}
						toAccount={accounts.toAccount}
					/>
					<BalanceInputMulti
						label={t('assetToSend')}
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
						ariaLabel={t('amountToSend')}
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
}
