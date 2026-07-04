// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'

export type RowSectionProps = ComponentBase & {
	// The CSS order of the component for vertical layouts.
	vLast?: boolean
	// `true` means padding on the left and false means padding on the right.
	hLast?: boolean
	// `true` means the secondary element and  false means the primary one.
	secondary?: boolean
	// `true` means row is hostiing only a singular element.
	standalone?: boolean
}
