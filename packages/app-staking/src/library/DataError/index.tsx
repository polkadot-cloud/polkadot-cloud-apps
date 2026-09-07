// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
import { useTranslation } from 'react-i18next'
import { ButtonText } from 'ui-buttons'
export const DataError = ({ retry }: { retry: () => void }) => {
	const { t } = useTranslation('app')
	return (
		<div role="alert" style={{ padding: '1rem' }}>
			{t('dataUnavailable', { defaultValue: 'Unable to load data.' })}{' '}
			<ButtonText
				text={t('retry', { defaultValue: 'Retry' })}
				onClick={retry}
			/>
		</div>
	)
}
