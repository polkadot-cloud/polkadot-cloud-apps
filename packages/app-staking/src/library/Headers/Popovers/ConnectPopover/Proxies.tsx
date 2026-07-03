// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import ArrowsSvg from 'assets/icons/arrows.svg?react'
import { useTranslation } from 'react-i18next'
import { ConnectItem } from 'ui-core/popover'
import { useOverlay } from 'ui-overlay'
import type { SetOpenProp } from './types'

export const Proxies = ({ setOpen }: SetOpenProp) => {
	const { t } = useTranslation()
	const { openModal } = useOverlay().modal

	return (
		<ConnectItem.Container>
			<h4>{t('proxies', { ns: 'modals' })}</h4>
			<section>
				<ConnectItem.Item
					asButton
					last={true}
					onClick={() => {
						setOpen(false)
						openModal({
							key: 'ExternalAccounts',
							size: 'sm',
							options: {
								type: 'proxies',
							},
						})
					}}
				>
					<div>
						<ConnectItem.Logo Svg={ArrowsSvg} />
					</div>
					<div>
						<div>
							<h3>{t('proxyAccounts', { ns: 'modals' })}</h3>
						</div>
						<ConnectItem.Icon faIcon={faChevronRight} />
					</div>
				</ConnectItem.Item>
			</section>
		</ConnectItem.Container>
	)
}
