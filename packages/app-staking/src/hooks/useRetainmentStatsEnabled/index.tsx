// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useDataCapabilities } from 'data-gate/react'

export const useRetainmentStatsEnabled = () => useDataCapabilities().retainment
