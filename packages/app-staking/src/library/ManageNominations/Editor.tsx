// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { MaxNominations } from 'consts'
import { useManageNominations } from 'contexts/ManageNominations'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { GenerateNominations } from 'library/GenerateNominations'
import { MenuControls } from 'library/GenerateNominations/Controls/MenuControls'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import type { DisplayFor, NominationSelection } from 'types'
import { Main } from 'ui-core/canvas'
import { MenuAction } from './MenuAction'

interface EditorProps {
	bondFor: 'nominator' | 'pool'
	displayFor: DisplayFor
	canSubmit?: boolean
	dappName?: string
	eligibilityLoading?: boolean
	optimalSelectionOnly?: boolean
	standaloneCards?: boolean
	poolId?: number
	callbackSubmit?: () => void
	callbackInBlock?: (nominationAddresses: string[]) => void
}

export const Editor = ({
	bondFor,
	displayFor,
	canSubmit = true,
	dappName,
	eligibilityLoading = false,
	optimalSelectionOnly = false,
	standaloneCards = false,
	poolId,
	callbackSubmit,
	callbackInBlock,
}: EditorProps) => {
	const { serviceApi } = useApi()
	const { activeProxy } = useActiveProxy()
	const { activeAccount } = useActiveAccount()
	const {
		active: healthCheckActive,
		hasDangerWarnings,
		isLoading: healthCheckLoading,
	} = useNominationHealth()
	const { defaultNominations, nominations, setNominations, method } =
		useManageNominations()

	const isPool = bondFor === 'pool'
	const nominationsMatch =
		nominations.length === defaultNominations.length &&
		nominations.every(({ address }) =>
			defaultNominations.some((nomination) => nomination.address === address),
		)
	const hasSubmittableChanges =
		MaxNominations >= nominations.length &&
		nominations.length > 0 &&
		!nominationsMatch
	const valid =
		canSubmit &&
		hasSubmittableChanges &&
		(!healthCheckActive || (!healthCheckLoading && !hasDangerWarnings))
	const nominationAddresses = nominations.map(({ address }) => address)

	const getTx = () => {
		if (!valid) {
			return
		}
		if (!isPool) {
			return serviceApi.tx.stakingNominate(nominationAddresses)
		}
		if (poolId !== undefined) {
			return serviceApi.tx.poolNominate(poolId, nominationAddresses)
		}
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		dappName,
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: valid,
		callbackSubmit,
		callbackInBlock: () => callbackInBlock?.(nominationAddresses),
	})

	const setters = [
		{
			current: {
				callable: true,
				fn: () => nominations,
			},
			set: ({ nominations: nextNominations }: NominationSelection) =>
				setNominations(nextNominations),
		},
	]

	const menuControls = (
		<MenuControls
			allowRevert={Boolean(method)}
			disabled={!canSubmit || eligibilityLoading}
			optimalSelectionOnly={optimalSelectionOnly}
			setters={setters}
			action={
				method ? (
					<MenuAction
						isPool={isPool}
						submitExtrinsic={submitExtrinsic}
						valid={valid}
					/>
				) : undefined
			}
		/>
	)

	const nominationsList = (
		<GenerateNominations
			canManageNominations={canSubmit}
			displayFor={displayFor}
			eligibilityLoading={eligibilityLoading}
			menuControls={standaloneCards ? menuControls : undefined}
			setters={setters}
			standaloneCards={standaloneCards}
		/>
	)

	return (
		<>
			{!standaloneCards && menuControls}
			{displayFor === 'canvas' ? (
				<Main size="xl" withMenu>
					{nominationsList}
				</Main>
			) : (
				nominationsList
			)}
		</>
	)
}
