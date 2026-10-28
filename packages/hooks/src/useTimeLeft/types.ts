// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TimeLeftRaw } from 'types'

export interface UseTimeleftProps {
	// Dependencies to trigger re-calculation of timeleft.
	depsTimeleft: unknown[]
	// Dependencies to trigger re-render of timeleft, e.g. if language switching occurs.
	depsFormat: unknown[]
}

export interface TimeLeftAll {
	raw: TimeLeftRaw
}
