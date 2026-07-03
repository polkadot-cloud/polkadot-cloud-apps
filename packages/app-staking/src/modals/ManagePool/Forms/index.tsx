// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ForwardedRef } from 'react'
import { forwardRef } from 'react'
import { ContentWrapper } from '../Wrappers'
import { ClaimCommission } from './ClaimCommission'
import { LeavePool } from './LeavePool'
import { ManageCommission } from './ManageCommission'
import { PoolCommissionProvider } from './ManageCommission/provider'
import { RenamePool } from './RenamePool'
import { SetClaimPermission } from './SetClaimPermission'
import { SetPoolState } from './SetPoolState'
import type { FormsProps } from './types'

export const Forms = forwardRef(
	(
		{
			setSection,
			task,
			section,
			incrementCalculateHeight,
			onResize,
		}: FormsProps,
		ref: ForwardedRef<HTMLDivElement>,
	) => {
		const commonFormProps = {
			task,
			section,
			setSection,
			onResize,
		}
		return (
			<PoolCommissionProvider>
				<ContentWrapper>
					<div className="items" ref={ref}>
						{task === 'set_pool_metadata' ? (
							<RenamePool {...commonFormProps} />
						) : task === 'manage_commission' ? (
							<ManageCommission
								{...commonFormProps}
								incrementCalculateHeight={incrementCalculateHeight}
							/>
						) : task === 'set_claim_permission' ? (
							<SetClaimPermission {...commonFormProps} />
						) : task === 'leave_pool' ? (
							<LeavePool {...commonFormProps} />
						) : task === 'claim_commission' ? (
							<ClaimCommission {...commonFormProps} />
						) : (
							<SetPoolState {...commonFormProps} />
						)}
					</div>
				</ContentWrapper>
			</PoolCommissionProvider>
		)
	},
)

Forms.displayName = 'Forms'
