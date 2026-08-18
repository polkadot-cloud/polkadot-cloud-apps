// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useManageNominations } from 'contexts/ManageNominations'
import { SelectableWrapper } from 'library/List'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary, ButtonSecondary } from 'ui-buttons'
import type { InlineControlsProps } from './types'

export const InlineControls = ({ displayFor }: InlineControlsProps) => {
	const { t } = useTranslation()
	const { method, revertNominations } = useManageNominations()

	// Determine button style depending on in canvas
	const ButtonType = displayFor === 'canvas' ? ButtonPrimary : ButtonSecondary
	const allowRegenerate = method === 'Optimal Selection'

	if (!allowRegenerate) {
		return null
	}

	return (
		<SelectableWrapper>
			{allowRegenerate && (
				<ButtonType
					text={t('reGenerate', { ns: 'app' })}
					onClick={() => revertNominations()}
				/>
			)}
		</SelectableWrapper>
	)
}
