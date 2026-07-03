// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons'
import { useHelp } from 'hooks/useHelp'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { ListStatusHeader } from 'library/List'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from 'ui-buttons'
import { CardHeader } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import type { NominationsEmptyProps } from '../Nominations/types'

export const Empty = ({
	bondFor,
	nominator,
	nominated,
	disabled,
	title,
}: NominationsEmptyProps) => {
	const { t } = useTranslation()
	const { openHelpTooltip } = useHelp()
	const { openCanvas } = useOverlay().canvas

	return (
		<>
			<CardHeader action margin>
				<h3>
					{title || t('nominations', { ns: 'pages' })}
					<ButtonHelpTooltip
						marginLeft
						definition="Nominations"
						openHelp={openHelpTooltip}
					/>
				</h3>
				<div>
					<ButtonPrimary
						size="md"
						iconLeft={faChevronCircleRight}
						iconTransform="grow-1"
						text={t('nominate', { ns: 'pages' })}
						disabled={disabled}
						onClick={() =>
							openCanvas({
								key: 'ManageNominations',
								scroll: false,
								options: {
									bondFor,
									nominator,
									nominated,
								},
							})
						}
					/>
				</div>
			</CardHeader>
			<ListStatusHeader>{t('notNominating', { ns: 'app' })}.</ListStatusHeader>
		</>
	)
}
