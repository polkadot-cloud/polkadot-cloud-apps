// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { PageTitle } from 'library/PageTitle'
import { useTranslation } from 'react-i18next'
import { Active } from './Active'
import { Wrapper } from './Wrappers'

export const Nominate = () => {
	const { t } = useTranslation()

	return (
		<Wrapper>
			<PageTitle title={t('nominate', { ns: 'pages' })} />
			<Active />
		</Wrapper>
	)
}
