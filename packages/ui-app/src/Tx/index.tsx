// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Signer } from './Signer'
import type { TxProps } from './types'
import { PromptWrapper, txClasses, Wrapper } from './Wrapper'

export type { SignerProps, TxProps } from './types'
export { SubmitButtonWrapper } from './Wrapper'

/**
 * @name Tx
 * @summary A wrapper to handle transaction submission.
 */
export const Tx = (props: TxProps) => {
	const {
		margin,
		notEnoughFunds,
		dangerMessage,
		PromptComponent,
		SubmitComponent,
		displayFor = 'default',
		transparent,
		stacked = false,
		hideSigner = false,
	} = props

	const innerClasses = [
		txClasses.inner,
		['canvas', 'card'].includes(displayFor) ? txClasses[displayFor] : undefined,
		transparent ? txClasses.transparent : undefined,
		stacked ? txClasses.stacked : undefined,
		hideSigner ? txClasses.hideSigner : undefined,
	]
		.filter(Boolean)
		.join(' ')

	// TODO: revise these new wrappers
	const wrapperClasses = [
		margin ? txClasses.margin : undefined,
		transparent ? txClasses.noPadding : undefined,
	]
		.filter(Boolean)
		.join(' ')

	return (
		<Wrapper className={wrapperClasses}>
			<div className={innerClasses}>
				{!hideSigner && (
					<div className={txClasses.signer}>
						<Signer
							{...props}
							dangerMessage={dangerMessage}
							notEnoughFunds={notEnoughFunds}
							PromptComponent={PromptComponent}
						/>
						<PromptWrapper>{PromptComponent}</PromptWrapper>
					</div>
				)}
				<div className={txClasses.submit}>{SubmitComponent}</div>
			</div>
		</Wrapper>
	)
}
