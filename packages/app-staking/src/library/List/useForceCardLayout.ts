// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useMediaQuery } from 'usehooks-ts'

export const useForceCardLayout = () => useMediaQuery('(max-width: 1249px)')
