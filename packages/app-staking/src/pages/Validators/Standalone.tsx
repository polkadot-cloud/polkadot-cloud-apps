// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { ValidatorsContent } from './Content'

export const ValidatorsStandalone = () => {
	const { t } = useTranslation('pages')

	return (
		<>
			<Page.Title title={t('validators')} />
			<ValidatorsContent showShareLink={false} toggleFavorites={false} />
		</>
	)
}
