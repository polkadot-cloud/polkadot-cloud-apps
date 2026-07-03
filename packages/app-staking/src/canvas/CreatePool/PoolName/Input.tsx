// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AnyJson } from 'types'

export const Input = ({
	listenIsValid,
	defaultValue,
	setters = [],
	value = '',
}: AnyJson) => {
	const { t } = useTranslation('pages')
	const { activeAddress } = useActiveAccount()

	// the current local bond value
	const [metadata, setMetadata] = useState<string>(value)

	// handle change for bonding
	const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
		const val = ev.target.value
		listenIsValid(val !== '')
		setMetadata(val)

		// apply value to parent setters
		for (const s of setters) {
			s.set({
				...s.current,
				metadata: val,
			})
		}
	}

	// reset value to default when changing account
	useEffect(() => {
		setMetadata(defaultValue ?? '')
	}, [activeAddress])

	return (
		<>
			<div style={{ margin: '1rem 0' }}>
				<input
					className="underline"
					style={{ width: '100%' }}
					placeholder={t('poolName')}
					type="text"
					onChange={(e) => handleChange(e)}
					value={metadata ?? ''}
				/>
			</div>
			<p>{t('poolNameSupport')}</p>
		</>
	)
}
