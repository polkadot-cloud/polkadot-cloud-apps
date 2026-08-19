// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useManageNominations } from 'contexts/ManageNominations'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useTheme } from 'hooks/useTheme'
import { Confirm } from 'library/Prompt/Confirm'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UseSubmitExtrinsic } from 'tx-submit/types'
import { ButtonSubmit } from 'ui-buttons'
import { Popover } from 'ui-core/popover'
import { Form } from './Form'

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
	const { themeElementRef } = useTheme()
	const { setNominations } = useManageNominations()
	const {
		active: healthCheckActive,
		hasDangerWarnings,
		lowRetainmentValidators,
	} = useNominationHealth()
	const [open, setOpen] = useState(false)
	const needsFix = healthCheckActive && hasDangerWarnings

	useEffect(() => setOpen(false), [needsFix, valid])

	const removeLowRetainers = () => {
		const addressesToRemove = new Set(
			lowRetainmentValidators.map(({ address }) => address),
		)
		setNominations((current) =>
			current.filter(({ address }) => !addressesToRemove.has(address)),
		)
		setOpen(false)
	}

	if (needsFix) {
		return (
			<Popover
				open={open}
				onOpenChange={setOpen}
				portalContainer={themeElementRef.current || undefined}
				side="bottom"
				align="end"
				sideOffset={8}
				content={
					<Confirm
						text={t('lowRetainmentRemoval', {
							count: lowRetainmentValidators.length,
						})}
						controlKey="fix_nomination_issues"
						onClose={() => setOpen(false)}
						onRevert={removeLowRetainers}
					/>
				}
			>
				<ButtonSubmit asLabel lg text={t('fixIssues')} />
			</Popover>
		)
	}

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			disabled={!valid}
			portalContainer={themeElementRef.current || undefined}
			width="min(380px, calc(100vw - 2rem))"
			side="bottom"
			align="end"
			sideOffset={8}
			content={
				<Form
					valid={valid}
					requiresMigratedController={!isPool}
					submitExtrinsic={submitExtrinsic}
				/>
			}
		>
			<ButtonSubmit
				asLabel
				lg
				text={t('submit', { ns: 'modals' })}
				pulse={valid}
				disabled={!valid}
			/>
		</Popover>
	)
}
