// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCaretDown,
	faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import { useManageNominations } from 'contexts/ManageNominations'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useTranslation } from 'react-i18next'
import { ButtonMenu } from 'ui-buttons'
import { Spinner } from 'ui-core/base'
import { ConfirmAction } from '../ConfirmAction'
import { Revert } from '../Revert'
import type { MenuControlsProps } from './types'

export const MenuControls = ({
	setters,
	allowRevert,
	action,
	disabled = false,
	optimalSelectionOnly = false,
}: MenuControlsProps) => {
	const { t } = useTranslation()
	const { active: healthCheckActive, isLoading: healthCheckLoading } =
		useNominationHealth()

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
						className={
							disabled ? 'generateButton generateDisabled' : 'generateButton'
						}
						disabled={disabled}
						iconLeft={faWandMagicSparkles}
						iconRight={faCaretDown}
						text={t('generate', { ns: 'app' })}
					/>
				</ConfirmAction>
			)}
			{(allowRevert || action) && (
				<div className="actions">
					{healthCheckActive && healthCheckLoading && (
						<div
							role="status"
							aria-label={t('loadingValidatorDetails', { ns: 'app' })}
						>
							<Spinner />
						</div>
					)}
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
