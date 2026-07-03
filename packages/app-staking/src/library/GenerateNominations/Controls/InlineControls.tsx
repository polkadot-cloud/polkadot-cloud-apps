// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { useManageNominations } from 'contexts/ManageNominations'
import { SelectableWrapper } from 'library/List'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary, ButtonSecondary } from 'ui-buttons'
import { Revert } from '../Revert'
import type { InlineControlsProps } from './types'

export const InlineControls = ({
	setters,
	displayFor,
	allowRevert,
}: InlineControlsProps) => {
	const { t } = useTranslation()

	const {
		method,
		setMethod,
		nominations,
		updateSetters,
		setNominations,
		resetNominations,
		revertNominations,
		defaultNominations,
	} = useManageNominations()

	// Determine button style depending on in canvas
	const ButtonType = displayFor === 'canvas' ? ButtonPrimary : ButtonSecondary

	return (
		<SelectableWrapper>
			{method && (
				<>
					<ButtonType
						text={t('startAgain', { ns: 'app' })}
						iconLeft={faChevronLeft}
						iconTransform="shrink-2"
						onClick={() => resetNominations(setters)}
					/>
					{['Active Low Commission', 'Optimal Selection'].includes(method) && (
						<ButtonType
							text={t('reGenerate', { ns: 'app' })}
							onClick={() => revertNominations()}
						/>
					)}
				</>
			)}
			{allowRevert && (
				<Revert
					disabled={
						JSON.stringify(nominations) === JSON.stringify(defaultNominations)
					}
					onClick={() => {
						setMethod('manual')
						updateSetters(setters, defaultNominations)
						setNominations(defaultNominations)
					}}
				/>
			)}
		</SelectableWrapper>
	)
}
