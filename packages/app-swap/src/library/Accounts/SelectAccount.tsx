// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useStablecoinAccountCategories } from 'hooks/useStablecoinAccountCategories'
import { Accounts as AccountSelector } from 'ui-modals/Accounts'

export const Accounts = () => (
	<AccountSelector useCategories={useStablecoinAccountCategories} />
)
