// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useList } from 'contexts/List'
import { useManageNominations } from 'contexts/ManageNominations'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { Spinner } from 'ui-core/base'
import { ConfirmAction } from '../ConfirmAction'
import type { SelectHandler } from '../types'

export const SelectionActions = ({
	disabled,
	selectHandler,
	target,
}: {
	disabled: boolean
	selectHandler?: SelectHandler
	target?: HTMLDivElement | null
}) => {
	const { t } = useTranslation('app')
	const { nominations } = useManageNominations()
	const { selected, removeFromSelected, resetSelected } = useList()
	const { active, isLoading } = useNominationHealth()
	const addresses = new Set(nominations.map(({ address }) => address))
	const selectedValidators = (selected as Validator[]).filter(({ address }) =>
		addresses.has(address),
	)

	// Individual removals and issue fixes must also discard their checkbox state.
	useEffect(() => {
		const removed = selected.filter(
			(item) =>
				!nominations.some(
					({ address }) => address === (item as Validator).address,
				),
		)
		if (removed.length) removeFromSelected(removed)
	}, [nominations, selected, removeFromSelected])

	if (!target) return null

	return createPortal(
		<>
			{active && isLoading && (
				<div role="status" aria-label={t('loadingValidatorDetails')}>
					<Spinner />
				</div>
			)}
			{selectHandler && selectedValidators.length > 0 && (
				<ConfirmAction
					attached={false}
					controlKey="removeSelected"
					disabled={disabled}
					text={selectHandler.popover.text}
					onConfirm={() =>
						selectHandler.popover.callback({
							selected: selectedValidators,
							callback: resetSelected,
						})
					}
				>
					<span>{selectHandler.title}</span>
				</ConfirmAction>
			)}
		</>,
		target,
	)
}
