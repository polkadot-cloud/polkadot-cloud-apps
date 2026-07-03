// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmitTxProps } from 'library/SubmitTx/types'
import type { ReactElement } from 'react'
import type { DisplayFor } from 'types'

export interface SignerProps extends SubmitTxProps {
	notEnoughFunds: boolean
	dangerMessage: string
	PromptComponent?: ReactElement
}

export interface TxProps extends SignerProps {
	margin?: boolean
	SubmitComponent: ReactElement
	PromptComponent?: ReactElement
	displayFor?: DisplayFor
	transparent?: boolean
	stacked?: boolean
}
