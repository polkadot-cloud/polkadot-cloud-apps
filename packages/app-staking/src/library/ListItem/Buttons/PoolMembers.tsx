// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { HeaderButton } from 'ui-core/list'
import { useOverlay } from 'ui-overlay'

export const PoolMembers = ({
	pool,
	memberCounter,
	outline,
}: {
	pool: BondedPool
	memberCounter: number
	outline?: boolean
}) => {
	const { t } = useTranslation('tips')
	const { openCanvas } = useOverlay().canvas
	const { id } = pool

	return (
		<HeaderButton outline={outline} withText>
			<button
				type="button"
				onClick={() => {
					openCanvas({
						key: 'PoolMembers',
						options: {
							poolId: id,
						},
						size: 'xl',
					})
				}}
				disabled={memberCounter === 0}
			>
				{t('members', { ns: 'pages' })}
			</button>
		</HeaderButton>
	)
}
