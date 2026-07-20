// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Spinner } from 'ui-core/base'
import classes from './index.module.scss'

export const OverlayPreload = ({ type }: { type: 'modal' | 'canvas' }) => (
	<div
		aria-label="Loading overlay"
		aria-live="polite"
		className={`${classes.preload} ${
			type === 'modal' ? classes.modal : classes.canvas
		}`}
		role="status"
	>
		<Spinner
			style={{
				width: type === 'canvas' ? '2.4rem' : '2rem',
			}}
		/>
	</div>
)
