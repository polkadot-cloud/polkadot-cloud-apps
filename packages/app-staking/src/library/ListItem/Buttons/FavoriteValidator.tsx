// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { emitNotification } from 'global-bus'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { useTooltip } from 'hooks/useTooltip'
import { useTranslation } from 'react-i18next'
import { TooltipArea } from 'ui-core/base'
import { HeaderButton } from 'ui-core/list'
import type { FavoriteProps } from '../types'

export const FavoriteValidator = ({ address, outline }: FavoriteProps) => {
	const { t } = useTranslation('app')
	const { setTooltipTextAndOpen } = useTooltip()
	const { favorites, addFavorite, removeFavorite } = useFavoriteValidators()

	const isFavorite = favorites.includes(address)

	const notificationFavorite = !isFavorite
		? {
				title: t('favoriteValidatorAdded'),
				subtitle: address,
			}
		: {
				title: t('favoriteValidatorRemoved'),
				subtitle: address,
			}

	const tooltipText = `${isFavorite ? `${t('remove')}` : `${t('add')}`} ${t(
		'favorite',
	)}`

	return (
		<HeaderButton outline={outline}>
			<TooltipArea
				pointer
				text={tooltipText}
				onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
				onClick={() => {
					if (isFavorite) {
						removeFavorite(address)
					} else {
						addFavorite(address)
					}
					emitNotification(notificationFavorite)
				}}
			/>
			<button type="button" className={isFavorite ? 'active' : undefined}>
				<FontAwesomeIcon
					icon={!isFavorite ? faHeartRegular : faHeart}
					transform="shrink-2"
				/>
			</button>
		</HeaderButton>
	)
}
