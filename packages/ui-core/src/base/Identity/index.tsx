// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@w3ux/react-polkicon'
import type { IdentityProps } from '../types'
import classes from './index.module.scss'

export const Identity = ({
	address,
	iconSize,
	Action,
	label,
	value,
	style,
}: IdentityProps) => (
	<div className={classes.identity} style={style}>
		<span>
			<Polkicon address={address} fontSize={iconSize} />
		</span>
		<div>
			<h3>{label}</h3>
			<h4>
				{value}
				<span>{Action}</span>
			</h4>
		</div>
	</div>
)
