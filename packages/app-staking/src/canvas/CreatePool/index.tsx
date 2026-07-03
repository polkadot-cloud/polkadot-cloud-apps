// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Bond } from 'canvas/CreatePool/Bond'
import { PoolName } from 'canvas/CreatePool/PoolName'
import { PoolRoles } from 'canvas/CreatePool/PoolRoles'
import { Summary } from 'canvas/CreatePool/Summary'
import { CardWrapper } from 'library/Card/Wrappers'
import { Nominate } from 'library/SetupSteps/Nominate'
import { useTranslation } from 'react-i18next'
import { Head, Main, Title } from 'ui-core/canvas'
import { CloseCanvas } from 'ui-overlay'

export const CreatePool = () => {
	const { t } = useTranslation()

	return (
		<Main>
			<Head>
				<CloseCanvas />
			</Head>
			<Title>
				<h1>{t('createAPool', { ns: 'pages' })}</h1>
			</Title>
			<CardWrapper className="canvas">
				<PoolName section={1} />
			</CardWrapper>
			<CardWrapper className="canvas">
				<Nominate bondFor="pool" section={2} />
			</CardWrapper>
			<CardWrapper className="canvas">
				<PoolRoles section={3} />
			</CardWrapper>
			<CardWrapper className="canvas">
				<Bond section={4} />
			</CardWrapper>
			<CardWrapper className="canvas">
				<Summary section={5} />
			</CardWrapper>
		</Main>
	)
}
