// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MaxNominations } from 'consts'
import { emitNotification } from 'global-bus'
import { useFavoriteValidators } from 'hooks/useFavoriteValidators'
import { Identity } from 'library/ListItem/Labels/Identity'
import { FooterWrapper, PromptListItem } from 'library/Prompt/Wrappers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { ButtonPrimary } from 'ui-buttons'
import { Checkbox } from 'ui-core/list'
import { Title } from 'ui-core/prompt'
import { usePrompt } from 'ui-overlay'
import type { PromptProps } from '../types'

export const SelectFavorites = ({ callback, nominations }: PromptProps) => {
	const { t } = useTranslation('modals')
	const { closePrompt } = usePrompt()
	const { favoritesList } = useFavoriteValidators()

	// Store the total number of selected favorites
	const [selected, setSelected] = useState<Validator[]>([])

	const addToSelected = (item: Validator) =>
		setSelected([...selected].concat(item))

	const removeFromSelected = (items: Validator[]) =>
		setSelected([...selected].filter((item) => !items.includes(item)))

	const remaining = MaxNominations - nominations.length - selected.length
	const canAdd = remaining > 0

	return (
		<>
			<Title title={t('nominateFavorites')} onClose={closePrompt} />
			<div className="padded">
				{remaining <= 0 ? (
					<h4 className="subheading">
						{t('moreFavoritesSurpassLimit', {
							max: MaxNominations,
						})}
					</h4>
				) : (
					<h4 className="subheading">
						{t('addUpToFavorites', { count: remaining })}.
					</h4>
				)}

				{favoritesList?.map((favorite: Validator) => {
					const inInitial = !!nominations.find(
						({ address }) => address === favorite.address,
					)
					const isDisabled = selected.includes(favorite) || !canAdd || inInitial

					return (
						<PromptListItem
							key={`favorite_${favorite.address}`}
							className={isDisabled && inInitial ? 'inactive' : undefined}
						>
							<Checkbox
								checked={inInitial || selected.includes(favorite)}
								onClick={() => {
									if (selected.includes(favorite)) {
										removeFromSelected([favorite])
									} else {
										addToSelected(favorite)
									}
								}}
							/>
							<Identity address={favorite.address} />
						</PromptListItem>
					)
				})}
				<FooterWrapper>
					<ButtonPrimary
						text={t('addToNominations')}
						onClick={() => {
							callback(nominations.concat(selected))
							emitNotification({
								title: t('favoritesAddedTitle', { count: selected.length }),
								subtitle: t('favoritesAddedSubtitle', {
									count: selected.length,
								}),
							})
						}}
						disabled={selected.length === 0}
					/>
				</FooterWrapper>
			</div>
		</>
	)
}
