// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { ValidatorList } from 'library/ValidatorList'
import { useTranslation } from 'react-i18next'
import { Head, Main, Title } from 'ui-core/canvas'
import { CloseCanvas, useOverlay } from 'ui-overlay'

export const OperatorValidators = () => {
	const { t } = useTranslation('app')
	const { formatWithPrefs } = useValidators()
	const {
		config: { options },
	} = useOverlay().canvas
	const address = typeof options?.address === 'string' ? options.address : ''
	const display = typeof options?.display === 'string' ? options.display : ''
	const validatorAddresses = Array.isArray(options?.validators)
		? options.validators.filter(
				(validator): validator is string => typeof validator === 'string',
			)
		: []
	const validators = formatWithPrefs(validatorAddresses)
	const operatorLabel = display || address

	return (
		<Main>
			<Head>
				<CloseCanvas />
			</Head>
			<Title>
				<h1>
					{operatorLabel ? `${operatorLabel}: ` : ''}
					{t('validators')}
				</h1>
			</Title>
			<ValidatorList
				validators={validators}
				displayFor="canvas"
				allowListFormat={false}
				showShareLink={false}
				toggleFavorites={false}
			/>
		</Main>
	)
}
