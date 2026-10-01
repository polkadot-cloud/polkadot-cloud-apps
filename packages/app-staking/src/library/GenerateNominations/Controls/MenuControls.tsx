// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCaretDown,
	faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import { useList } from 'contexts/List'
import { useManageNominations } from 'contexts/ManageNominations'
import { useTranslation } from 'react-i18next'
import { ButtonMenu } from 'ui-buttons'
import { RegenerateAction } from '../RegenerateAction'
import { Revert } from '../Revert'
import { nominationsAreEqual } from '../utils'
import type { MenuControlsProps } from './types'

export const MenuControls = ({
	children,
	setters,
	allowRevert,
	action,
	disabled = false,
	optimalSelectionOnly = false,
}: MenuControlsProps) => {
	const { t } = useTranslation()
	const { resetSelected } = useList()

	const {
		method,
		fetching,
		setMethod,
		nominations,
		updateSetters,
		setNominations,
		setFetching,
		defaultNominations,
	} = useManageNominations()

	return (
		<div className="menuControlsInner">
			<div className="scrollControls">
				{!method && (
					<ButtonMenu
						asLabel
						className="methodPrompt"
						disabled
						text={t('chooseNominationMethod', { ns: 'app' })}
					/>
				)}
				{method && (
					<RegenerateAction
						disabled={disabled || fetching}
						onRegenerate={() => {
							resetSelected()
							setMethod('Optimal Selection')
							setNominations([])
							setFetching(true)
						}}
					>
						<ButtonMenu
							asLabel
							disabled={disabled || fetching}
							iconLeft={faWandMagicSparkles}
							iconRight={faCaretDown}
							text={t('generate', { ns: 'app' })}
						/>
					</RegenerateAction>
				)}
				{children}
			</div>
			{(allowRevert || action) && (
				<div className="actions">
					{allowRevert && (
						<Revert
							disabled={
								disabled ||
								fetching ||
								nominationsAreEqual(nominations, defaultNominations)
							}
							onClick={() => {
								resetSelected()
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
