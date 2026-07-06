// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAnglesRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn } from '@w3ux/utils'
import classNames from 'classnames'
import type React from 'react'
import type { RoleChangeProps } from '../types'
import styles from './index.module.scss'

export const RoleChange: React.FC<RoleChangeProps> = ({
	roleName,
	oldAddress,
	newAddress,
}) => (
	<div className={styles.roleChangeWrapper}>
		<div className={styles.label}>{roleName}</div>
		<div className={styles.roleChange}>
			<div className={classNames(styles.inputWrap, styles.selected)}>
				<Polkicon address={oldAddress ?? ''} fontSize="2rem" />
				<div className={styles.input}>
					{oldAddress ? ellipsisFn(oldAddress) : ''}
				</div>
			</div>
			<span className={styles.arrow}>
				<FontAwesomeIcon icon={faAnglesRight} />
			</span>
			<div className={classNames(styles.inputWrap, styles.selected)}>
				<Polkicon address={newAddress ?? ''} fontSize="2rem" />
				<div className={styles.input}>
					{newAddress ? ellipsisFn(newAddress) : ''}
				</div>
			</div>
		</div>
	</div>
)
