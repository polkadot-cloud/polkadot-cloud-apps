// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useApi } from 'hooks/useApi'
import { useValidatorStats } from 'hooks/useStats'
import { CardWrapper } from 'library/Card/Wrappers'
import { Stats } from 'library/Stats'
import { ValidatorList } from 'library/ValidatorList'
import { useTranslation } from 'react-i18next'
import { Page, Stat } from 'ui-core/base'

export const AllValidators = () => {
	const { t } = useTranslation('pages')
	const { isReady } = useApi()
	const { getValidators } = useValidators()
	const validators = getValidators()
	const { activeValidators, totalValidators, averageCommission } =
		useValidatorStats()
	return (
		<>
			<Stat.Row>
				<Stats items={[activeValidators, totalValidators, averageCommission]} />
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
									bondFor="nominator"
									validators={validators}
									title={t('networkValidators')}
									selectable={false}
									defaultFilters={{
										includes: ['active'],
										excludes: [
											'all_commission',
											'blocked_nominations',
											'missing_identity',
										],
									}}
									defaultOrder="rank"
									allowListFormat={false}
									allowMoreCols
									allowFilters
									allowSearch
									itemsPerPage={50}
									toggleFavorites
								/>
							)}
						</>
					)}
				</CardWrapper>
			</Page.Row>
		</>
	)
}
