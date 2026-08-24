// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { OperatorListItem } from 'plugin-staking-api/types'
import { useOverlay } from 'ui-overlay'

export const useOpenOperatorValidators = ({
	identity,
	validators,
}: OperatorListItem) => {
	const { openCanvas } = useOverlay().canvas

	return () =>
		openCanvas({
			key: 'OperatorValidators',
			options: {
				address: identity.address,
				display: identity.display,
				validators,
			},
			size: 'xl',
		})
}
