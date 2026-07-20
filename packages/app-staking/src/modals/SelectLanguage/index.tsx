// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { locales } from 'locales'
import { changeLanguage } from 'locales/util'
import { useTranslation } from 'react-i18next'
import { ModalTitle } from 'ui-app/ModalTitle'
import { ButtonModal } from 'ui-buttons'
import { ButtonList, Padding } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'

export const SelectLanguage = () => {
	const { i18n, t } = useTranslation('modals')
	const { closeModal } = useOverlay().modal

	return (
		<>
			<ModalTitle title={t('selectLanguage')} />
			<Padding horizontalOnly style={{ marginTop: '1rem' }}>
				<ButtonList>
					{Object.entries(locales).map(([code, { label }]) => (
						<ButtonModal
							key={code}
							selected={i18n.resolvedLanguage === code}
							onClick={() => {
								changeLanguage(code, i18n)
								closeModal()
							}}
							text={label}
							label={i18n.resolvedLanguage === code ? t('selected') : undefined}
						/>
					))}
				</ButtonList>
			</Padding>
		</>
	)
}
