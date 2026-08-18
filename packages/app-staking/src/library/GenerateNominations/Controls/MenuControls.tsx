// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useManageNominations } from 'contexts/ManageNominations'
import { useTranslation } from 'react-i18next'
import { ButtonMenu } from 'ui-buttons'
import { Revert } from '../Revert'
import type { MenuControlsProps } from './types'
import { MenuWrapper } from './Wrappers'

export const MenuControls = ({
	setters,
	allowRevert,
	action,
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

	return (
		<MenuWrapper>
			<div className="inner">
				{!method && (
					<ButtonMenu
						asLabel
						disabled
						text={t('chooseNominationMethod', { ns: 'app' })}
					/>
				)}
				{method && (
					<ButtonMenu
						text={t('reGenerate', { ns: 'app' })}
						onClick={() => {
							setMethod('Optimal Selection')
							setNominations([])
							setFetching(true)
						}}
					/>
				)}
				{(allowRevert || action) && (
					<div className="actions">
						{allowRevert && (
							<Revert
								inMenu
								disabled={
									JSON.stringify(nominations) ===
									JSON.stringify(defaultNominations)
								}
								onClick={() => {
									setMethod('manual')
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
