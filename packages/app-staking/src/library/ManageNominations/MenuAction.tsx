// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useManageNominations } from 'contexts/ManageNominations'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { MenuPopover } from 'library/GenerateNominations/Controls/MenuPopover'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UseSubmitExtrinsic } from 'tx-submit/types'
import { ButtonSubmit, ButtonSubmitWithFee } from 'ui-buttons'
import { Form } from './Form'
import { FixIssuesFooter, NominationSummary } from './Wrappers'

export const MenuAction = ({
	isPool,
	submitExtrinsic,
	valid,
}: {
	isPool: boolean
	submitExtrinsic: UseSubmitExtrinsic
	valid: boolean
}) => {
	const { t } = useTranslation('app')
	const { setNominations } = useManageNominations()
	const {
		active: healthCheckActive,
		hasDangerWarnings,
		lowRetainmentCount,
		flaggedValidatorCount,
		validatorsWithIssues,
	} = useNominationHealth()
	const [open, setOpen] = useState(false)
	const needsFix = healthCheckActive && hasDangerWarnings
	const disabled = !needsFix && !valid

	useEffect(() => setOpen(false), [needsFix, valid])

	const removeValidatorsWithIssues = () => {
		const addressesToRemove = new Set(
			validatorsWithIssues.map(({ address }) => address),
		)
		setNominations((current) =>
			current.filter(({ address }) => !addressesToRemove.has(address)),
		)
		setOpen(false)
	}

	return (
		<MenuPopover
			open={open}
			onOpenChange={setOpen}
			disabled={disabled}
			width="min(380px, calc(100vw - 2rem))"
			align="end"
			content={
				needsFix ? (
					<>
						<NominationSummary>
							<h3>{t('fixIssues')}</h3>
							<div className="row">
								<span>{t('lowRetainmentValidators')}</span>
								<span>{lowRetainmentCount}</span>
							</div>
							<div className="row">
								<span>{t('validatorsWithWarnings')}</span>
								<span>{flaggedValidatorCount}</span>
							</div>
							<div className="row total">
								<span>{t('totalValidatorsToRemove')}:</span>
								<span>{validatorsWithIssues.length}</span>
							</div>
						</NominationSummary>
						<FixIssuesFooter>
							<ButtonSubmitWithFee
								pulse
								submitText={t('confirm')}
								onSubmit={removeValidatorsWithIssues}
							/>
						</FixIssuesFooter>
					</>
				) : (
					<Form
						valid={valid}
						requiresMigratedController={!isPool}
						submitExtrinsic={submitExtrinsic}
					/>
				)
			}
		>
			<ButtonSubmit
				asLabel
				lg
				text={needsFix ? t('fixIssues') : t('submit', { ns: 'modals' })}
				pulse={!needsFix && valid}
				disabled={disabled}
			/>
		</MenuPopover>
	)
}
