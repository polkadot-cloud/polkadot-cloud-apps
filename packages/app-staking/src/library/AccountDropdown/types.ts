// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ImportedAccount } from 'types'

export interface AccountDropdownProps {
	accounts: ImportedAccount[]
	initialAccount: ImportedAccount | null
	onSelect?: (account: ImportedAccount | null) => void
	onOpenChange?: (isOpen: boolean) => void
	label?: string
	placeholder?: string
	disabled?: boolean
}
