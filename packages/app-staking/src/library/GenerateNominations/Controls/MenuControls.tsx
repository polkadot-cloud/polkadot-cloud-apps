// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useManageNominations } from 'contexts/ManageNominations'
import { useTranslation } from 'react-i18next'
import { ButtonMenu } from 'ui-buttons'
import { ConfirmAction } from '../ConfirmAction'
import { Revert } from '../Revert'
import type { MenuControlsProps } from './types'
import { MenuWrapper } from './Wrappers'

export const MenuControls = ({
	setters,
	allowRevert,
	action,
	optimalSelectionOnly = false,
}: MenuControlsProps) => {
	const { t } = useTranslation()
	const { activeAddress } = useActiveAccount()
	const generateDisabled = optimalSelectionOnly && !activeAddress

	const {
		method,
		setMethod,
		nominations,
		updateSetters,
		setNominations,
		setFetching,
		defaultNominations,
	} = useManageNominations()

	return (
		<MenuWrapper $compact={optimalSelectionOnly}>
			<div className="menuControlsInner">
				{!method && (
					<ButtonMenu
						asLabel
						disabled
						text={t('chooseNominationMethod', { ns: 'app' })}
					/>
				)}
				{method && (
					<ConfirmAction
						align="start"
						controlKey="regenerate_nominations"
						disabled={generateDisabled}
						onConfirm={() => {
							setMethod('Optimal Selection')
							setNominations([])
							setFetching(true)
						}}
						text={t('regenerateNominationSelection', { ns: 'modals' })}
					>
						<ButtonMenu
							asLabel
							className={generateDisabled ? 'generateDisabled' : undefined}
							disabled={generateDisabled}
							iconLeft={optimalSelectionOnly ? faWandMagicSparkles : undefined}
							text={
								optimalSelectionOnly
									? 'Generate'
									: t('reGenerate', { ns: 'app' })
							}
						/>
					</ConfirmAction>
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
									setMethod(
										optimalSelectionOnly ? 'Optimal Selection' : 'manual',
									)
									updateSetters(setters, defaultNominations)
									setNominations(defaultNominations)
								}}
							/>
						)}
						{action}
					</div>
				)}
			</div>
		</MenuWrapper>
	)
}
