// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'motion/react'
import SimpleBar from 'simplebar-react'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export const Container = ({ style, children }: ComponentBase) => (
	<motion.div style={style} className={classes.container}>
		<SimpleBar style={{ maxHeight: '75vh' }} autoHide={true}>
			<div className={classes.inner}>{children}</div>
		</SimpleBar>
	</motion.div>
)
