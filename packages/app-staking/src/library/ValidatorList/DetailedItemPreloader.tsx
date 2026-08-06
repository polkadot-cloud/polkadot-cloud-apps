// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { Loader } from 'ui-core/base'
import { BarWrapper, ItemWrapper } from './Wrappers'

export const DetailedItemPreloader = ({
	format,
}: {
	format: 'row' | 'col'
}) => {
	const { t } = useTranslation('app')
	const label = t('loadingValidatorDetails', {
		defaultValue: 'Loading validator details',
	})
	const height = format === 'row' ? '5.5rem' : '29.5rem'
	const Wrapper = format === 'row' ? BarWrapper : ItemWrapper

	return (
		<Wrapper aria-busy="true" aria-label={label}>
			<div className="inner">
				<Loader
					style={{
						borderRadius: '0.5rem',
						display: 'block',
						height,
						width: '100%',
					}}
				/>
			</div>
		</Wrapper>
	)
}
