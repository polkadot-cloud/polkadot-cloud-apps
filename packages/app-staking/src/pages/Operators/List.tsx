// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { StakingApiOperatorList } from 'library/StakingApiOperatorList'
import { CardWrapper } from 'ui-app/Card'
import { Page } from 'ui-core/base'

export const List = () => (
	<Page.Row>
		<CardWrapper>
			<StakingApiOperatorList />
		</CardWrapper>
	</Page.Row>
)
