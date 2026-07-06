// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import MailSVG from 'assets/icons/mail.svg?react'
import { PlatformSupportEmail } from 'consts'
import { useTranslation } from 'react-i18next'
import { ModalTitle } from 'ui-app/ModalTitle'
import { Padding, Support } from 'ui-core/modal'

export const MailSupport = () => {
	const { t } = useTranslation('modals')
	return (
		<>
			<ModalTitle />
			<Padding verticalOnly>
				<Support>
					<MailSVG />
					<h4>{t('supportEmail')}</h4>
					<h1>{PlatformSupportEmail}</h1>
				</Support>
			</Padding>
		</>
	)
}
