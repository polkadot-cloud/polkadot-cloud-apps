// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { formatAccountSs58, isValidAddress } from '@w3ux/util-dedot'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { RoleEditInputProps } from '../types'
import { Wrapper } from './Wrapper'

export const RoleEditInput = ({
	setRoleEdit,
	roleKey,
	roleEdit,
}: RoleEditInputProps) => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { ss58 } = getStakingChainData(network)

	const processRoleEdit = (newAddress: string) => {
		let edit = {
			newAddress,
			valid: newAddress === '', // empty address is valid and removes the role
			reformatted: false,
		}
		if (isValidAddress(newAddress)) {
			const addressFormatted = formatAccountSs58(newAddress, ss58)
			if (addressFormatted) {
				edit = {
					newAddress: addressFormatted,
					valid: true,
					reformatted: true,
				}
			} else {
				edit = { newAddress, valid: true, reformatted: false }
			}
		}
		return { ...roleEdit, ...edit }
	}

	const handleChange = (e: FormEvent<HTMLInputElement>) => {
		const newValue = e.currentTarget.value
		// set value on key change
		const edit = processRoleEdit(newValue)
		setRoleEdit(roleKey, edit)
	}

	let label
	let labelClass
	if (!roleEdit?.valid) {
		label = t('addressInvalid')
		labelClass = 'danger'
	} else if (roleEdit?.reformatted) {
		label = t('reformatted')
		labelClass = 'neutral'
	}

	return (
		<Wrapper>
			<div className="input">
				<section>
					<input
						placeholder={t('address')}
						type="text"
						onChange={(e: FormEvent<HTMLInputElement>) => handleChange(e)}
						value={roleEdit?.newAddress ?? ''}
					/>
				</section>
			</div>
			{label && <h5 className={labelClass}>{label}</h5>}
		</Wrapper>
	)
}
