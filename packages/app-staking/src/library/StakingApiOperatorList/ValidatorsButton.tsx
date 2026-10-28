// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { OperatorListItem } from 'plugin-staking-api/types'
import { useTranslation } from 'react-i18next'
import { HeaderButton } from 'ui-core/list'
import { useOpenOperatorValidators } from './useOpenOperatorValidators'

export const ValidatorsButton = ({
	operator,
}: {
	operator: OperatorListItem
}) => {
	const { t } = useTranslation('app')
	const openOperatorValidators = useOpenOperatorValidators(operator)

	return (
		<HeaderButton withText>
			<button type="button" onClick={openOperatorValidators}>
				{t('validators')}
			</button>
		</HeaderButton>
	)
}
