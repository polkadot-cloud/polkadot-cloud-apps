// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import styles from './index.module.scss'
import type { PageToggleProps } from './types'

export const PageToggle = ({
	syncing,
	page,
	totalItems,
	setPageHandler,
}: PageToggleProps) => {
	const { t } = useTranslation()

	totalItems = syncing ? 1 : totalItems

	return (
		<div className={styles.pageToggle}>
			{!syncing && (
				<h4 className={totalItems === 1 ? styles.disabled : undefined}>
					{totalItems > 1 && (
						<>
							<span>{page}</span>
							{t('module.of', { ns: 'tips' })}
							<span>{totalItems}</span>
						</>
					)}
				</h4>
			)}
			<span>
				<button
					type="button"
					disabled={totalItems === 1 || page === 1}
					onClick={() => {
						setPageHandler(page - 1)
					}}
				>
					<FontAwesomeIcon
						icon={faChevronLeft}
						className="icon"
						transform="shrink-1"
					/>
				</button>
			</span>
			<span>
				<button
					type="button"
					disabled={totalItems === 1 || page === totalItems}
					onClick={() => {
						setPageHandler(page + 1)
					}}
				>
					<FontAwesomeIcon
						icon={faChevronRight}
						className="icon"
						transform="shrink-1"
					/>
				</button>
			</span>
		</div>
	)
}
