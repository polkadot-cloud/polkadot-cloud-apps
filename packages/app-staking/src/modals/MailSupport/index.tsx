// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import MailSVG from 'assets/icons/mail.svg?react'
import { PlatformSupportEmail } from 'consts'
import { Title } from 'library/Modal/Title'
import { useTranslation } from 'react-i18next'
import { Padding, Support } from 'ui-core/modal'

export const MailSupport = () => {
	const { t } = useTranslation('modals')
	return (
		<>
			<Title />
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
