// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FooterWrapper } from 'library/Prompt/Wrappers'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from 'ui-buttons'
import { Title } from 'ui-core/prompt'
import { usePrompt } from 'ui-overlay'
import type { RevertPromptProps } from '../types'

export const RevertChanges = ({ onRevert }: RevertPromptProps) => {
	const { t } = useTranslation('modals')
	const { closePrompt } = usePrompt()

	return (
		<>
			<Title title={t('revertNominations')} onClose={closePrompt} />
			<div className="body">
				<h4 className="subheading">{t('revertNominationChanges')}</h4>
				<FooterWrapper>
					<ButtonPrimary
						size="lg"
						marginRight
						text={t('revertChanges')}
						onClick={() => onRevert()}
					/>
				</FooterWrapper>
			</div>
		</>
	)
}
