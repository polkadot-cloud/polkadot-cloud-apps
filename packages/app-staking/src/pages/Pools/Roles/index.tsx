// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCheckCircle,
	faEdit,
	faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useHelp } from 'hooks/useHelp'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary, ButtonPrimaryInvert } from 'ui-buttons'
import { ButtonRow, CardHeader } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import { RolesWrapper } from '../ManagePool/Wrappers'
import { PoolAccount } from '../PoolAccount'
import { RoleEditInput } from './RoleEditInput'
import type { RoleEditEntry, RolesProps } from './types'

export const Roles = ({
	defaultRoles,
	setters = [],
	inline = false,
	listenIsValid,
}: RolesProps) => {
	const { t } = useTranslation('pages')
	const { isReady } = useApi()
	const { network } = useNetwork()
	const { openHelpTooltip } = useHelp()
	const { openModal } = useOverlay().modal
	const { activeAddress } = useActiveAccount()
	const { isOwner, activePool } = useActivePool()
	const { syncing } = useSyncing(['active-pools'])
	const { isReadOnlyAccount } = useImportedAccounts()

	const { id } = activePool || { id: 0 }
	const roles = defaultRoles

	const initialiseEdits = (() => {
		const initState: Record<string, RoleEditEntry> = {}
		Object.entries(defaultRoles).forEach(([role, who]) => {
			initState[role] = {
				oldAddress: who,
				newAddress: who,
				valid: true,
				reformatted: false,
			}
		})
		return initState
	})()

	// store any role edits that take place
	const [roleEdits, setRoleEdits] =
		useState<Record<string, RoleEditEntry>>(initialiseEdits)

	// store whether roles are being edited
	const [isEditing, setIsEditing] = useState<boolean>(false)

	// is this the initial fetch
	const [fetched, setFetched] = useState<boolean>(false)

	// update default roles on account switch
	useEffect(() => {
		setIsEditing(false)
		setRoleEdits(initialiseEdits)
		setFetched(false)
	}, [activeAddress, network])

	// fetch accounts meta batch
	useEffect(() => {
		if (isReady && !fetched) {
			setFetched(true)
		}
	}, [isReady, fetched])

	const isRoleEditsValid = () => {
		for (const roleEdit of Object.values<RoleEditEntry>(roleEdits)) {
			if (!roleEdit?.valid) {
				return false
			}
		}
		return true
	}

	// logic for saving edit state
	const saveHandler = () => {
		setIsEditing(false)

		// if setters available, use those to update
		// parent component state.
		if (setters.length) {
			if (listenIsValid) {
				listenIsValid(isRoleEditsValid())
			}
			const rolesUpdated: Record<string, string> = {}
			for (const [k, v] of Object.entries(roleEdits)) {
				rolesUpdated[k] = v.newAddress
			}
			for (const s of setters) {
				s.set({
					...s.current,
					roles: rolesUpdated,
				})
			}
		} else {
			// else, open modal with role edits data to update pool roles.
			openModal({
				key: 'ChangePoolRoles',
				options: { id, roleEdits },
				size: 'sm',
			})
		}
	}

	// enter edit state
	const editHandler = () => {
		setRoleEdits(initialiseEdits)
		setIsEditing(true)
	}

	// cancel editing and revert edit state
	const cancelHandler = () => {
		setRoleEdits(initialiseEdits)
		setIsEditing(false)
	}

	// passed down to `RoleEditInput` to update roleEdits
	const setRoleEditHandler = (role: string, edit: RoleEditEntry) => {
		const newEdit = {
			...roleEdits,
			[role]: edit,
		}
		setRoleEdits(newEdit)
	}

	const ButtonType = inline ? ButtonPrimaryInvert : ButtonPrimary

	return (
		<>
			<CardHeader action margin>
				{!inline && (
					<h3>
						{t('roles')}
						<ButtonHelpTooltip
							marginLeft
							definition="Pool Roles"
							openHelp={openHelpTooltip}
						/>
					</h3>
				)}

				{!(isOwner() || setters.length) ? null : (
					<ButtonRow
						style={{
							justifyContent: 'right',
							width: '100%',
						}}
					>
						{isEditing && (
							<ButtonType
								iconLeft={faTimesCircle}
								iconTransform="grow-1"
								text={t('cancel')}
								disabled={syncing || isReadOnlyAccount(activeAddress)}
								onClick={() => cancelHandler()}
							/>
						)}
						&nbsp;&nbsp;
						<ButtonType
							iconLeft={isEditing ? faCheckCircle : faEdit}
							iconTransform="grow-1"
							text={isEditing ? t('save') : t('edit')}
							disabled={
								syncing ||
								isReadOnlyAccount(activeAddress) ||
								!isRoleEditsValid()
							}
							onClick={() => (isEditing ? saveHandler() : editHandler())}
						/>
					</ButtonRow>
				)}
			</CardHeader>
			<RolesWrapper>
				<section>
					<div className="inner">
						<h4>{t('depositor')}</h4>
						<PoolAccount address={roles.depositor ?? null} pool={activePool} />
					</div>
				</section>
				<section>
					<div className="inner">
						<h4>{t('root')}</h4>
						{isEditing ? (
							<RoleEditInput
								roleKey="root"
								roleEdit={roleEdits?.root}
								setRoleEdit={setRoleEditHandler}
							/>
						) : (
							<PoolAccount address={roles.root ?? null} pool={activePool} />
						)}
					</div>
				</section>
				<section>
					<div className="inner">
						<h4>{t('nominator')}</h4>
						{isEditing ? (
							<RoleEditInput
								roleKey="nominator"
								roleEdit={roleEdits?.nominator}
								setRoleEdit={setRoleEditHandler}
							/>
						) : (
							<PoolAccount
								address={roles.nominator ?? null}
								pool={activePool}
							/>
						)}
					</div>
				</section>
				<section>
					<div className="inner">
						<h4>{t('bouncer')}</h4>
						{isEditing ? (
							<RoleEditInput
								roleKey="bouncer"
								roleEdit={roleEdits?.bouncer}
								setRoleEdit={setRoleEditHandler}
							/>
						) : (
							<PoolAccount address={roles.bouncer ?? null} pool={activePool} />
						)}
					</div>
				</section>
			</RolesWrapper>
		</>
	)
}
