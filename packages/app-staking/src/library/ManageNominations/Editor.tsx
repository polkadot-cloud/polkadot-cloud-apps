// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { MaxNominations } from 'consts'
import { useManageNominations } from 'contexts/ManageNominations'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { GenerateNominations } from 'library/GenerateNominations'
import { MenuControls } from 'library/GenerateNominations/Controls/MenuControls'
import {
	MenuWrapper,
	StandaloneMenuWrapper,
} from 'library/GenerateNominations/Controls/Wrappers'
import type { ConnectStatus } from 'library/GenerateNominations/types'
import { nominationsAreEqual } from 'library/GenerateNominations/utils'
import type { ReactNode } from 'react'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import type { DisplayFor, NominationSelection } from 'types'
import { MenuAction } from './MenuAction'

interface EditorProps {
	bondFor: 'nominator' | 'pool'
	displayFor: DisplayFor
	canSubmit?: boolean
	dappName?: string
	eligibilityLoading?: boolean
	ineligibleStatus?: Exclude<ConnectStatus, 'disconnected'>
	optimalSelectionOnly?: boolean
	standaloneCards?: boolean
	poolId?: number
	selectionActionTarget?: HTMLDivElement | null
	callbackSubmit?: () => void
	callbackInBlock?: (nominationAddresses: string[]) => void
}

export const Editor = ({
	bondFor,
	displayFor,
	canSubmit = true,
	dappName,
	eligibilityLoading = false,
	ineligibleStatus,
	optimalSelectionOnly = false,
	standaloneCards = false,
	poolId,
	selectionActionTarget,
	callbackSubmit,
	callbackInBlock,
}: EditorProps) => {
	const { serviceApi } = useApi()
	const { activeProxy } = useActiveProxy()
	const { activeAccount } = useActiveAccount()
	const { accountHasSigner } = useImportedAccounts()
	const {
		active: healthCheckActive,
		hasDangerWarnings,
		isLoading: healthCheckLoading,
	} = useNominationHealth()
	const { defaultNominations, nominations, setNominations, method } =
		useManageNominations()

	const isPool = bondFor === 'pool'

	const nominationAddresses = nominations.map(({ address }) => address)

	const nominationsChanged = !nominationsAreEqual(
		nominations,
		defaultNominations,
	)

	const hasSubmittableChanges =
		nominationAddresses.length > 0 &&
		nominationAddresses.length <= MaxNominations &&
		nominationsChanged

	const healthCheckPassed =
		!healthCheckActive || (!healthCheckLoading && !hasDangerWarnings)
	const hasSigner =
		accountHasSigner(activeAccount) || accountHasSigner(activeProxy)

	// The final submission guard shared by the transaction and submit control.
	const submissionValid =
		canSubmit && hasSigner && hasSubmittableChanges && healthCheckPassed

	const tx = submissionValid
		? isPool
			? poolId === undefined
				? undefined
				: serviceApi.tx.poolNominate(poolId, nominationAddresses)
			: serviceApi.tx.stakingNominate(nominationAddresses)
		: undefined

	const submitExtrinsic = useSubmitExtrinsic({
		tx,
		dappName,
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: submissionValid,
		callbackSubmit,
		callbackInBlock: () => callbackInBlock?.(nominationAddresses),
	})

	// Adapt the local nomination state to the shared generator setter interface.
	const nominationSetters = [
		{
			current: {
				callable: true,
				fn: () => nominations,
			},
			set: ({ nominations: nextNominations }: NominationSelection) =>
				setNominations(nextNominations),
		},
	]

	const MenuControlsWrapper = standaloneCards
		? StandaloneMenuWrapper
		: MenuWrapper

	const menuAction = method ? (
		<MenuAction
			isPool={isPool}
			submitExtrinsic={submitExtrinsic}
			valid={submissionValid}
		/>
	) : undefined

	// Render all controls within the generator's shared selection provider.
	const menuControls = (validatorControls: ReactNode) => (
		<MenuControlsWrapper>
			<MenuControls
				allowRevert={Boolean(method)}
				action={menuAction}
				disabled={!canSubmit || eligibilityLoading}
				optimalSelectionOnly={optimalSelectionOnly}
				setters={nominationSetters}
			>
				{validatorControls}
			</MenuControls>
		</MenuControlsWrapper>
	)

	return (
		<GenerateNominations
			canManageNominations={canSubmit}
			displayFor={displayFor}
			eligibilityLoading={eligibilityLoading}
			ineligibleStatus={ineligibleStatus}
			menuControls={menuControls}
			setters={nominationSetters}
			selectionActionTarget={selectionActionTarget}
			standaloneCards={standaloneCards}
		/>
	)
}
