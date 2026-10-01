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

	// Whether nominations are being managed for a pool rather than a nominator.
	const isPool = bondFor === 'pool'

	// The validator addresses supplied to the nomination extrinsic.
	const nominationAddresses = nominations.map(({ address }) => address)

	// Whether the current selection differs from the initial nominations.
	const nominationsChanged = !nominationsAreEqual(
		nominations,
		defaultNominations,
	)

	// Whether the selection contains a valid set of changes to submit.
	const hasSubmittableChanges =
		nominationAddresses.length > 0 &&
		nominationAddresses.length <= MaxNominations &&
		nominationsChanged

	// Whether nomination health permits the current selection to be submitted.
	const healthCheckPassed =
		!healthCheckActive || (!healthCheckLoading && !hasDangerWarnings)
	const hasSigner =
		accountHasSigner(activeAccount) || accountHasSigner(activeProxy)

	// The final submission guard shared by the transaction and submit control.
	const submissionValid =
		canSubmit && hasSigner && hasSubmittableChanges && healthCheckPassed

	// Build the appropriate nomination transaction once submission is valid.
	const tx = submissionValid
		? isPool
			? poolId === undefined
				? undefined
				: serviceApi.tx.poolNominate(poolId, nominationAddresses)
			: serviceApi.tx.stakingNominate(nominationAddresses)
		: undefined

	// Prepare the wallet submission lifecycle for the generated transaction.
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

	// Select the wrapper here, where the page layout is already known.
	const MenuControlsWrapper = standaloneCards
		? StandaloneMenuWrapper
		: MenuWrapper

	// Only expose the submission action after a nomination method is selected.
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
