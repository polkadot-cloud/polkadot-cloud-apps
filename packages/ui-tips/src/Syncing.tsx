// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import styles from './index.module.scss'

export const Syncing = () => {
	const { t } = useTranslation('tips')

	return (
		<motion.div
			className={styles.itemsWrapper}
			initial="show"
			animate={undefined}
			variants={{
				hidden: { opacity: 0 },
				show: {
					opacity: 1,
				},
			}}
		>
			<motion.div className={styles.itemWrapper}>
				<div className={styles.itemInner}>
					<section
						style={{
							marginLeft: '0.5rem',
							marginRight: '0.25rem',
							width: '1.5rem',
							height: '1.5rem',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<FontAwesomeIcon icon={faRefresh} spin color="var(--gray-900)" />
					</section>
					<section>
						<div className={styles.desc}>
							<button type="button" disabled>
								<h4>{t('module.oneMoment')}...</h4>
							</button>
						</div>
					</section>
				</div>
			</motion.div>
		</motion.div>
	)
}
