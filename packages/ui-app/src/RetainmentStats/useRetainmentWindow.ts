// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react'

export type RetainmentWindow = 'oneMonth' | 'threeMonths'

export const useRetainmentWindow = <T>(
	windows?: Record<RetainmentWindow, T | null>,
) => {
	const [window, setWindow] = useState<RetainmentWindow>('threeMonths')

	return { period: windows?.[window] ?? undefined, window, setWindow }
}
