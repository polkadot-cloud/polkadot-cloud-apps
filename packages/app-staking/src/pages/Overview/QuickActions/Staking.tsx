// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
/** biome-ignore-all lint/correctness/noNestedComponentDefinitions: <> */
// SPDX-License-Identifier: GPL-3.0-only

import { useActivePool } from 'hooks/useActivePool'
import { useQuickActions } from 'hooks/useQuickActions'
import type { BondFor } from 'types'
import { QuickAction } from 'ui-buttons'
import type { ButtonQuickActionProps } from 'ui-buttons/types'

export const Staking = ({ bondFor }: { bondFor: BondFor[] }) => {
	const { isDepositor } = useActivePool()
	const { baseQuickActions, getBondQuickAction, getUnbondQuickAction } =
		useQuickActions()

	const actions: ButtonQuickActionProps[] = []

	actions.push(baseQuickActions.send)

	if (bondFor.includes('pool')) {
		actions.push(
			baseQuickActions.withdrawPoolRewards,
			baseQuickActions.compoundPoolRewards,
		)
	}

	if (bondFor.includes('nominator')) {
		actions.push(baseQuickActions.claimNominatorPayouts)
	}

	// Do not include bond/unbond actions for dual stakers
	if (bondFor.length === 1) {
		actions.push(
			getBondQuickAction(bondFor[0]!),
			getUnbondQuickAction(bondFor[0]!),
		)
	}

	if (bondFor.includes('nominator')) {
		actions.push(baseQuickActions.updatePayee)
	}

	if (bondFor.length === 1 && bondFor[0] === 'nominator') {
		actions.push(baseQuickActions.nominatorUnstake)
	}

	if (bondFor.length === 1 && bondFor[0] === 'pool') {
		if (!isDepositor()) {
			actions.push(baseQuickActions.leavePool)
		}
	}

	return (
		<QuickAction.Container>
			{actions.map((action) => (
				<QuickAction.Button key={`action-${action.label}`} {...action} />
			))}
		</QuickAction.Container>
	)
}
