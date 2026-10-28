// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
/** biome-ignore-all lint/correctness/noNestedComponentDefinitions: <> */
// SPDX-License-Identifier: GPL-3.0-only

import { useActivePool } from 'hooks/useActivePool'
import { useQuickActions } from 'hooks/useQuickActions'
import type { BondFor } from 'types'
import { QuickAction } from 'ui-buttons'
import type { ButtonQuickActionProps } from 'ui-buttons/types'

interface StakingProps {
	bondFor: BondFor[]
	isValidator: boolean
}

export const Staking = ({ bondFor, isValidator }: StakingProps) => {
	const { isDepositor } = useActivePool()
	const {
		baseQuickActions,
		getBondQuickAction,
		getManageNominationsQuickAction,
		getUnbondQuickAction,
	} = useQuickActions()

	const actions: ButtonQuickActionProps[] = []

	if (isValidator) {
		// Email and Discord are always available in the quick actions footer.
		actions.push(
			baseQuickActions.send,
			getBondQuickAction('nominator'),
			getUnbondQuickAction('nominator'),
			baseQuickActions.updatePayee,
		)
	} else {
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

		const manageNominationsQuickAction =
			getManageNominationsQuickAction(bondFor)
		if (manageNominationsQuickAction) {
			actions.push(manageNominationsQuickAction)
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
	}

	const visibleActions =
		actions.length > 6
			? actions.filter(
					(action) =>
						action !== baseQuickActions.nominatorUnstake &&
						action !== baseQuickActions.leavePool,
				)
			: actions

	return (
		<QuickAction.Container>
			{visibleActions.map((action) => (
				<QuickAction.Button key={`action-${action.label}`} {...action} />
			))}
		</QuickAction.Container>
	)
}
