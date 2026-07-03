// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useApi } from 'hooks/useApi'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { CardWrapper } from 'library/Card/Wrappers'
import { ListStatusHeader } from 'library/List'
import { ValidatorList } from 'library/ValidatorList'
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'

export const ValidatorFavorites = () => {
	const { t } = useTranslation('pages')
	const { isReady } = useApi()
	const { favoritesList } = useFavoriteValidators()

	return (
		<Page.Row>
			<CardWrapper>
				{favoritesList === null ? (
					<ListStatusHeader>
						{t('fetchingFavoriteValidators')}...
					</ListStatusHeader>
				) : (
					isReady &&
					(favoritesList.length > 0 ? (
						<ValidatorList
							bondFor="nominator"
							validators={favoritesList}
							title={t('favoriteValidators')}
							selectable={false}
							allowListFormat={false}
							allowFilters
							allowMoreCols
							toggleFavorites
						/>
					) : (
						<ListStatusHeader>{t('noFavorites')}</ListStatusHeader>
					))
				)}
			</CardWrapper>
		</Page.Row>
	)
}
