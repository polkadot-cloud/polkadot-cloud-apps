// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Loader, Page } from 'ui-core/base'
import { CardWrapper } from '../Card'
import { Stat } from '../Stat'

export interface PagePreloaderProps {
	showStats?: boolean
	statsCount?: number
}

export const PagePreloader = ({
	showStats = true,
	statsCount = 3,
}: PagePreloaderProps) => (
	<>
		{showStats && (
			<Stat.Row>
				{Array.from({ length: statsCount }, (_, index) => (
					// Static loading placeholders have no identity or state.
					// biome-ignore lint/suspicious/noArrayIndexKey: See above.
					<Stat.Loading key={`stat_preloader_${index + 1}`} />
				))}
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
