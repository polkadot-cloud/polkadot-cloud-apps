// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useApi } from 'hooks/useApi'
import { useValidatorStats } from 'hooks/useStats'
import { useValidatorDetailsEnabled } from 'hooks/useValidatorDetailsEnabled'
import { Stats } from 'library/Stats'
import { ValidatorList } from 'library/ValidatorList'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from 'ui-app/Card'
import { Stat } from 'ui-app/Stat'
import { ButtonSecondary } from 'ui-buttons'
import { Page } from 'ui-core/base'

export const ValidatorsNode = ({
	showShareLink = true,
	toggleFavorites = true,
}: {
	showShareLink?: boolean
	toggleFavorites?: boolean
}) => {
	const { t } = useTranslation('pages')
	const { isReady } = useApi()
	const validatorDetailsEnabled = useValidatorDetailsEnabled()
	const { getValidators, validatorsFetched, validatorsError, retryValidators } =
		useValidators([], true)
	const validators = getValidators()
	const { activeValidators, totalValidators, minValidatorBond } =
		useValidatorStats()
	return (
		<>
			<Stat.Row>
				<Stats items={[activeValidators, totalValidators, minValidatorBond]} />
			</Stat.Row>
			<Page.Row>
				<CardWrapper>
					{validatorsError ? (
						<div className="item">
							<h3>{t('errorUnknown', { ns: 'app' })}</h3>
							<ButtonSecondary
								text={t('tryAgain', { ns: 'app' })}
								onClick={retryValidators}
							/>
						</div>
					) : !isReady ? (
						<div className="item">
							<h3>{t('connecting')}...</h3>
						</div>
					) : (
						<>
							{validatorsFetched !== 'synced' && (
								<div className="item">
									<h3>{t('fetchingValidators')}...</h3>
								</div>
							)}
							{validatorsFetched === 'synced' && validators.length > 0 && (
								<ValidatorList
									validators={validators}
									selectable={false}
									defaultConfig={{
										filters: {
											activeOnly: true,
											excludeBlocked: true,
											excludeMissingIdentity: true,
										},
										order: 'ACTIVITY',
										search: '',
									}}
									allowListFormat={validatorDetailsEnabled}
									forceListFormat={validatorDetailsEnabled ? undefined : 'col'}
									itemsPerPage={50}
									showShareLink={showShareLink}
									toggleFavorites={toggleFavorites}
								/>
							)}
						</>
					)}
				</CardWrapper>
			</Page.Row>
		</>
	)
}
