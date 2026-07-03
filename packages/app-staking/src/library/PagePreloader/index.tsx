// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CardWrapper } from 'library/Card/Wrappers'
import { Loader, Page, Stat } from 'ui-core/base'

export const PagePreloader = ({
	showStats = true,
}: {
	showStats?: boolean
}) => (
	<>
		{showStats && (
			<Stat.Row>
				<Stat.Loading />
				<Stat.Loading />
				<Stat.Loading />
			</Stat.Row>
		)}
		<Page.Row>
			<CardWrapper height={80}>
				<Loader
					style={{
						height: '100%',
						width: '100%',
						maxHeight: '75px',
					}}
				/>
			</CardWrapper>
		</Page.Row>
	</>
)
