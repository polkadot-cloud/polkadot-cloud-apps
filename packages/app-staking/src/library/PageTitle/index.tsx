// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentProps } from 'react'
import { Page } from 'ui-core/base'
import { NominationWarnings } from '../NominationWarnings'

export const PageTitle = ({
	showNominationWarnings = false,
	...props
}: ComponentProps<typeof Page.Title> & {
	showNominationWarnings?: boolean
}) => (
	<>
		<Page.Title {...props} />
		{showNominationWarnings && <NominationWarnings />}
	</>
)
