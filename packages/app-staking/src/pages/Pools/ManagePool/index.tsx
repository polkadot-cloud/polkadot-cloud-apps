// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useActivePool } from 'hooks/useActivePool'
import { CardWrapper } from 'library/Card/Wrappers'
import { Nominations } from 'library/Nominations'
import { Empty } from 'library/Nominations/Empty'
import { Page } from 'ui-core/base'

export const ManagePool = () => {
	const { formatWithPrefs } = useValidators()
	const { isOwner, isNominator, activePoolNominations, activePool } =
		useActivePool()

	const poolNominated = activePoolNominations
		? formatWithPrefs(activePoolNominations.targets)
		: []

	const isNominating = !!activePoolNominations?.targets?.length
	const nominator = activePool?.addresses?.stash ?? null
	const { state } = activePool?.bondedPool || {}

	const canNominate = isOwner() || isNominator()

	return (
		<Page.Row>
			<CardWrapper>
				{canNominate && !isNominating && state !== 'Destroying' ? (
					<Empty
						bondFor="pool"
						nominator={nominator}
						nominated={poolNominated}
						disabled={!canNominate}
					/>
				) : (
					<Nominations bondFor="pool" nominator={nominator} />
				)}
			</CardWrapper>
		</Page.Row>
	)
}
