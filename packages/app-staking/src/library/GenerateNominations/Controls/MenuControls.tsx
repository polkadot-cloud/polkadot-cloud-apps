// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { useManageNominations } from 'contexts/ManageNominations'
import { useTranslation } from 'react-i18next'
import { ButtonMenu } from 'ui-buttons'
import { ConfirmAction } from '../ConfirmAction'
import { Revert } from '../Revert'
import type { MenuControlsProps } from './types'

export const MenuControls = ({
	setters,
	allowRevert,
	action,
	controlHeaderAction,
	disabled = false,
	generateButtonLabel,
	optimalSelectionOnly = false,
}: MenuControlsProps) => {
	const { t } = useTranslation()

	const {
		method,
		setMethod,
		nominations,
		updateSetters,
		setNominations,
		setFetching,
		defaultNominations,
	} = useManageNominations()
	const showGenerateLabel =
		generateButtonLabel === 'generate' || optimalSelectionOnly

	return (
		<div className="menuControlsInner">
			{!method && (
				<ButtonMenu
					asLabel
					disabled
					text={t('chooseNominationMethod', { ns: 'app' })}
				/>
			)}
			{method && (
				<div className="generationActions">
					<ConfirmAction
						align="start"
						controlKey="regenerate_nominations"
						disabled={disabled}
						onConfirm={() => {
							setMethod('Optimal Selection')
							setNominations([])
							setFetching(true)
						}}
						text={t('regenerateNominationSelection', { ns: 'modals' })}
					>
						<ButtonMenu
							asLabel
							className={disabled ? 'generateDisabled' : undefined}
							disabled={disabled}
							iconLeft={showGenerateLabel ? faWandMagicSparkles : undefined}
							text={
								showGenerateLabel
									? t('generate', { ns: 'app' })
									: t('reGenerate', { ns: 'app' })
							}
						/>
					</ConfirmAction>
					{controlHeaderAction}
				</div>
			)}
			{(allowRevert || action) && (
				<div className="actions">
					{allowRevert && (
						<Revert
							disabled={
								JSON.stringify(nominations) ===
								JSON.stringify(defaultNominations)
							}
							onClick={() => {
								setMethod(optimalSelectionOnly ? 'Optimal Selection' : 'manual')
								updateSetters(setters, defaultNominations)
								setNominations(defaultNominations)
							}}
						/>
					)}
					{action}
				</div>
			)}
		</div>
	)
}
