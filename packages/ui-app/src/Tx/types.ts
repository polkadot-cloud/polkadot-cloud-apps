// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactElement } from 'react'
import type { DisplayFor, SubmitTxProps } from 'types'

export interface SignerProps extends SubmitTxProps {
	notEnoughFunds: boolean
	dangerMessage: string
	PromptComponent?: ReactElement
}

export interface TxProps extends SignerProps {
	SubmitComponent: ReactElement
	PromptComponent?: ReactElement
	displayFor?: DisplayFor
	stacked?: boolean
	hideSigner?: boolean
	margin?: boolean
	transparent?: boolean
}
