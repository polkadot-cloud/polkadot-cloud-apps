// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from 'ui-buttons'
import { Title } from 'ui-core/prompt'
import { usePrompt } from 'ui-overlay'
import type { TipProps } from './types'

export const Tip = ({ title, description, page, onPromptClick }: TipProps) => {
	const { t } = useTranslation()
	const { closePrompt } = usePrompt()

	return (
		<>
			<Title title={title} onClose={closePrompt} />
			<div className="body">
				{description.map((item) => (
					<h4 key={`inner_def_${item}`} className="definition">
						{item}
					</h4>
				))}
				<div style={{ marginTop: '1.75rem', display: 'flex' }}>
					{!!page && (
						<ButtonPrimary
							size="lg"
							marginRight
							text={`${t('goTo', { ns: 'app' })} ${t(page, {
								ns: 'app',
							})}`}
							onClick={() => {
								onPromptClick()
							}}
							iconRight={faAngleRight}
							iconTransform="shrink-1"
						/>
					)}
				</div>
			</div>
		</>
	)
}
