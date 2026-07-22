// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
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
		notEnoughFunds,
		dangerMessage,
		PromptComponent,
		SubmitComponent,
		displayFor = 'default',
		margin,
		transparent,
		stacked = false,
		hideSigner = false,
	} = props

	const outerClasses = [
		margin ? txClasses.margin : undefined,
		transparent ? txClasses.noPadding : undefined,
	]
		.filter(Boolean)
		.join(' ')

	const innerClasses = classNames(txClasses.inner, {
		[txClasses.canvas]: displayFor === 'canvas',
		[txClasses.card]: displayFor === 'card',
		[txClasses.transparent]: transparent,
		[txClasses.stacked]: stacked,
		[txClasses.hideSigner]: hideSigner,
	})

	return (
		<Wrapper className={outerClasses}>
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
