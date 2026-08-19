// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useManageNominations } from 'contexts/ManageNominations'
import { SelectableWrapper } from 'library/List'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary, ButtonSecondary } from 'ui-buttons'
import { ConfirmAction } from '../ConfirmAction'
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
			<ConfirmAction
				align="start"
				controlKey="regenerate_nominations"
				onConfirm={revertNominations}
				text={t('regenerateNominationSelection', { ns: 'modals' })}
			>
				<ButtonType asLabel text={t('reGenerate', { ns: 'app' })} />
			</ConfirmAction>
		</SelectableWrapper>
	)
}
