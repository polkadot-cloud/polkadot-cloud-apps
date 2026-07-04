// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight, faGlasses } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { ConnectItem } from 'ui-core/popover'
import { useOverlay } from 'ui-overlay'
import type { SetOpenProp } from './types'

const GlassesSvg = () => <ConnectItem.Icon faIcon={faGlasses} />

export const ReadOnly = ({ setOpen }: SetOpenProp) => {
	const { t } = useTranslation()
	const { openModal } = useOverlay().modal

	return (
		<ConnectItem.Container>
			<h4>{t('readOnly', { ns: 'modals' })}</h4>
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
								type: 'read-only',
							},
						})
					}}
				>
					<div>
						<GlassesSvg />
					</div>
					<div>
						<div>
							<h3>{t('readOnlyAccounts', { ns: 'modals' })}</h3>
						</div>
						<ConnectItem.Icon faIcon={faChevronRight} />
					</div>
				</ConnectItem.Item>
			</section>
		</ConnectItem.Container>
	)
}
