// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { Signer } from './Signer'
import type { TxProps } from './types'
import { PromptWrapper, Wrapper } from './Wrapper'

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
	} = props

	const innerClasses = classNames('inner', {
		[displayFor]: ['canvas', 'card'].includes(displayFor),
		transparent: !!transparent,
		stacked: !!stacked,
	})

	return (
		<Wrapper className={margin ? 'margin' : undefined}>
			<div className={innerClasses}>
				<div className="signer">
					<Signer
						{...props}
						dangerMessage={dangerMessage}
						notEnoughFunds={notEnoughFunds}
						PromptComponent={PromptComponent}
					/>
					<PromptWrapper>{PromptComponent}</PromptWrapper>
				</div>
				<div className="submit">{SubmitComponent}</div>
			</div>
		</Wrapper>
	)
}
