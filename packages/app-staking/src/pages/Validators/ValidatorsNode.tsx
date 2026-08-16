// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useApi } from 'hooks/useApi'
import { useValidatorStats } from 'hooks/useStats'
import { Stats } from 'library/Stats'
import { ValidatorList } from 'library/ValidatorList'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from 'ui-app/Card'
import { Stat } from 'ui-app/Stat'
import { Page } from 'ui-core/base'

export const ValidatorsNode = ({
	toggleFavorites = true,
}: {
	toggleFavorites?: boolean
}) => {
	const { t } = useTranslation('pages')
	const { isReady } = useApi()
	const { getValidators } = useValidators()
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
					{!isReady ? (
						<div className="item">
							<h3>{t('connecting')}...</h3>
						</div>
					) : (
						<>
							{validators.length === 0 && (
								<div className="item">
									<h3>{t('fetchingValidators')}...</h3>
								</div>
							)}
							{validators.length > 0 && (
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
									allowListFormat={false}
									forceListFormat="col"
									itemsPerPage={50}
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
