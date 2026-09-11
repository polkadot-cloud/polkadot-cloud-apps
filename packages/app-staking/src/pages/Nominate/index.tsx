// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { NominationWarnings } from 'library/NominationWarnings'
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { Active } from './Active'
import { Wrapper } from './Wrappers'

export const Nominate = () => {
	const { t } = useTranslation()

	return (
		<Wrapper>
			<Page.Title title={t('nominate', { ns: 'pages' })} />
			<NominationWarnings />
			<Active />
		</Wrapper>
	)
}
