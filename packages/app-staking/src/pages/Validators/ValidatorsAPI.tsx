// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidatorStats } from 'hooks/useStats'
import { StakingApiValidatorList } from 'library/StakingApiValidatorList'
import { Stats } from 'library/Stats'
import { CardWrapper } from 'ui-app/Card'
import { Stat } from 'ui-app/Stat'
import { Page } from 'ui-core/base'

export const ValidatorsAPI = ({
	toggleFavorites = true,
}: {
	toggleFavorites?: boolean
}) => {
	const { activeValidators, totalValidators, minValidatorBond } =
		useValidatorStats()

	return (
		<>
			<Stat.Row>
				<Stats items={[activeValidators, totalValidators, minValidatorBond]} />
			</Stat.Row>
			<Page.Row>
				<CardWrapper>
					<StakingApiValidatorList toggleFavorites={toggleFavorites} />
				</CardWrapper>
			</Page.Row>
		</>
	)
}
