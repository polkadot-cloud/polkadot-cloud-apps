// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useUi } from 'hooks/useUi'
import { ButtonHelp as Wrapper } from 'ui-buttons'
import type { ButtonHelpProps } from 'ui-buttons/types'

export const ButtonHelpTooltip = (props: ButtonHelpProps) => {
	const { showHelp } = useUi()

	if (!showHelp) {
		return null
	}

	return <Wrapper {...props} />
}
