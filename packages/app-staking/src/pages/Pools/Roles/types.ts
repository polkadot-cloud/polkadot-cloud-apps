// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction, PoolRoles } from 'types'

export interface RolesProps {
	defaultRoles: PoolRoles
	listenIsValid?: AnyFunction
	setters?: AnyFunction
	inline?: boolean
}

export interface RoleEditEntry {
	oldAddress: string
	newAddress: string
	valid: boolean
	reformatted: boolean
}

export interface RoleEditInputProps {
	roleKey: string
	roleEdit: RoleEditEntry
	setRoleEdit: (role: string, edit: RoleEditEntry) => void
}
