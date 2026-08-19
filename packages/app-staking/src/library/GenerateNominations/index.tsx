// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { NominationsView } from './NominationsView'
import type { GenerateNominationsProps } from './types'
import { useNominationControls } from './useNominationControls'
import { useNominationSync } from './useNominationSync'

export const GenerateNominations = ({
	setters = [],
	canManageNominations = true,
	displayFor = 'default',
	eligibilityLoading = false,
	menuControls,
	standaloneCards = false,
}: GenerateNominationsProps) => {
	// Keep nomination actions separate from synchronization and presentation.
	const { fetchNominations, filterHandlers, selectHandler, updateNominations } =
		useNominationControls({ canManageNominations, setters })

	useNominationSync({ fetchNominations, updateNominations })

	return (
		<NominationsView
			canManageNominations={canManageNominations}
			displayFor={displayFor}
			eligibilityLoading={eligibilityLoading}
			filterHandlers={filterHandlers}
			menuControls={menuControls}
			selectHandler={selectHandler}
			standaloneCards={standaloneCards}
		/>
	)
}
