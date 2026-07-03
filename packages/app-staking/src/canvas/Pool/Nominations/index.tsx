// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { NominationList } from 'library/NominationList'
import { useTranslation } from 'react-i18next'
import { Subheading } from 'ui-core/canvas'
import type { NominationsProps } from '../types'
import { NominationsWrapper } from '../Wrappers'

export const Nominations = ({ stash, poolId }: NominationsProps) => {
	const { t } = useTranslation()
	const { getValidators } = useValidators()
	const { poolsNominations } = useBondedPools()

	// Extract validator entries from pool targets.
	const targets = poolsNominations[poolId]?.targets || []
	const filteredTargets = getValidators().filter(({ address }) =>
		targets.includes(address),
	)

	return (
		<NominationsWrapper>
			<Subheading>
				<h3>
					{!targets.length
						? t('noNominationsSet', { ns: 'pages' })
						: `${targets.length} ${t('nominations', { ns: 'app', count: targets.length })}`}
				</h3>
			</Subheading>

			{targets.length > 0 && (
				<NominationList
					bondFor="pool"
					validators={filteredTargets}
					nominator={stash}
					displayFor="canvas"
				/>
			)}
		</NominationsWrapper>
	)
}
