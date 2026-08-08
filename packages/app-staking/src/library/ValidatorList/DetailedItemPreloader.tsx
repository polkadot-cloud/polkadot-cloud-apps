// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { ListItem } from 'ui-app/ListItem'

export const DetailedItemPreloader = ({
	format,
}: {
	format: 'row' | 'col'
}) => {
	const { t } = useTranslation('app')
	const label = t('loadingValidatorDetails')

	return <ListItem.Skeleton format={format} label={label} />
}
