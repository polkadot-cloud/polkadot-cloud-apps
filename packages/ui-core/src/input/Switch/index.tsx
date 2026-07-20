// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Switch as RadixSwitch } from 'radix-ui'
import type { SwitchProps } from '../types'
import classes from './index.module.scss'

export const Switch = ({ checked }: SwitchProps) => (
	<RadixSwitch.Root className={classes.root} checked={checked}>
		<RadixSwitch.Thumb className={classes.thumb} />
	</RadixSwitch.Root>
)
