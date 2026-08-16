// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import {
	type ValidatorSupportedNetwork,
	validatorListSupported,
} from '@w3ux/validator-assets'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useApi } from 'hooks/useApi'
import { ValidatorList } from 'library/ValidatorList'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { CardWrapper } from 'ui-app/Card'
import { ButtonSecondary } from 'ui-buttons'
import { Page } from 'ui-core/base'
import { useOperatorsSections } from './context'
import { Item } from './Item'
import { ItemsWrapper } from './Wrappers'

export const Entity = ({ network }: { network: ValidatorSupportedNetwork }) => {
	const { t } = useTranslation('pages')
	const { isReady } = useApi()
	const { getValidators, validatorsFetched } = useValidators()
	const { setActiveSection, activeItem } = useOperatorsSections()

	const { validators: entityAllValidators } = activeItem

	let validators: string[] = []
	if (validatorListSupported(network)) {
		const key = network as ValidatorSupportedNetwork
		validators = entityAllValidators?.[key] || []
	}

	const allValidators = getValidators()

	const operatorValidators: Validator[] = useMemo(
		() => allValidators.filter((v) => validators.includes(v.address)),
		[allValidators, validators],
	)

	const isFetchingOperators =
		validators.length > 0 && validatorsFetched !== 'synced'

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				duration: 0.5,
				staggerChildren: 0.05,
			},
		},
	}

	return (
		<Page.Row>
			<Page.Heading>
				<ButtonSecondary
					text={t('goBack')}
					iconLeft={faChevronLeft}
					iconTransform="shrink-3"
					onClick={() => setActiveSection(0)}
				/>
			</Page.Heading>
			<ItemsWrapper variants={container} initial="hidden" animate="show">
				<Item item={activeItem} actionable={false} network={network} />
			</ItemsWrapper>
			<CardWrapper>
				{!isReady ? (
					<div className="item">
						<h3>{t('connecting')}...</h3>
					</div>
				) : (
					<>
						{operatorValidators.length === 0 && (
							<div className="item">
								<h3>
									{isFetchingOperators
										? `${t('fetchingValidators')}...`
										: t('noValidators')}
								</h3>
							</div>
						)}
						{operatorValidators.length > 0 && (
							<ValidatorList
								validators={operatorValidators}
								allowListFormat={false}
								selectable={false}
								itemsPerPage={50}
								toggleFavorites
							/>
						)}
					</>
				)}
			</CardWrapper>
		</Page.Row>
	)
}
