// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PropsWithChildren } from 'react'
import { GraphInner, Subheading } from 'ui-core/canvas'
import classes from './index.module.scss'

export const graphSize = { width: '100%', height: 250 }

export const ChartSection = ({
	title,
	children,
}: PropsWithChildren<{ title: string }>) => (
	<section>
		<Subheading>
			<h3>{title}</h3>
		</Subheading>
		<div className={classes.graphPanel}>
			<GraphInner {...graphSize} noSpacing>
				{children}
			</GraphInner>
		</div>
	</section>
)
