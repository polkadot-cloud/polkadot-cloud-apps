// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CardWrapper } from 'library/Card/Wrappers'
import { Separator } from 'ui-core/base'
import { Preloader } from './Preloader'

export const StatusPreloader = ({ height }: { height: number }) => {
	return (
		<CardWrapper height={height}>
			<Preloader />
			<Separator />
			<Preloader />
		</CardWrapper>
	)
}
