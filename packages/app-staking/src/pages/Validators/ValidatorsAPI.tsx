// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidatorStats } from 'hooks/useStats'
import { CardWrapper } from 'library/Card/Wrappers'
import { StakingApiValidatorList } from 'library/StakingApiValidatorList'
import { Stats } from 'library/Stats'
import { Stat } from 'ui-app/Stat'
import { Page } from 'ui-core/base'

export const ValidatorsAPI = () => {
	const { activeValidators, totalValidators, minValidatorBond } =
		useValidatorStats()

	return (
		<>
			<Stat.Row>
				<Stats items={[activeValidators, totalValidators, minValidatorBond]} />
			</Stat.Row>
			<Page.Row>
				<CardWrapper>
					<StakingApiValidatorList />
				</CardWrapper>
			</Page.Row>
		</>
	)
}
