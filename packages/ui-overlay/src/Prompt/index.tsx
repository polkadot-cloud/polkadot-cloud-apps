// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	ContentWrapper,
	HeightWrapper,
	PromptBackdropButton,
	PromptInner as PromptInnerWrapper,
	PromptWrapper,
} from 'ui-core/prompt'
import { usePrompt } from '../Provider'

export const Prompt = () => {
	const {
		size,
		status,
		closePrompt,
		Prompt: PromptInner,
		closeOnOutsideClick,
	} = usePrompt()

	if (status === 0) {
		return null
	}

	return (
		<PromptWrapper>
			<PromptInnerWrapper>
				<HeightWrapper size={size}>
					<ContentWrapper>{PromptInner}</ContentWrapper>
				</HeightWrapper>
				<PromptBackdropButton
					aria-label="Close prompt"
					onClick={() => {
						if (closeOnOutsideClick) {
							closePrompt()
						}
					}}
				>
					&nbsp;
				</PromptBackdropButton>
			</PromptInnerWrapper>
		</PromptWrapper>
	)
}
