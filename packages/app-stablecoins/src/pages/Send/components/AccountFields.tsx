// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ImportedAccount } from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { SendForm } from 'ui-core/input'
import classes from '../Send.module.scss'
import type { AccountFieldsProps } from './types'

const accountKey = (prefix: string, account: ImportedAccount | null) =>
	`${prefix}-${account?.address || 'empty'}-${account?.source || 'none'}`

export const AccountFields = ({
	accounts,
	accountsWithSigners,
	fromAccount,
	onFromSelect,
	onToSelect,
	toAccount,
}: AccountFieldsProps) => (
	<>
		<SendForm.Segment title="Send From" layer="raised">
			<div className={classes.accountDropdown}>
				<AccountDropdown
					key={accountKey('from', fromAccount)}
					initialAccount={fromAccount}
					accounts={accountsWithSigners}
					onSelect={onFromSelect}
					placeholder="Select sender account..."
					disabled={!accountsWithSigners.length}
				/>
			</div>
		</SendForm.Segment>
		<SendForm.DirectionIndicator />
		<SendForm.Segment title="Send To" layer="raised">
			<div className={classes.accountDropdown}>
				<AccountDropdown
					key={accountKey('to', toAccount)}
					initialAccount={toAccount}
					accounts={accounts}
					onSelect={onToSelect}
					placeholder="Enter recipient address..."
				/>
			</div>
		</SendForm.Segment>
	</>
)
