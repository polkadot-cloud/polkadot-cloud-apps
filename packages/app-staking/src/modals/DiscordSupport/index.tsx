// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DiscordOutlineSvg from 'assets/brands/discordOutline.svg?react'
import { DiscordSupportURL } from 'consts'
import { Title } from 'library/Modal/Title'
import { useTranslation } from 'react-i18next'
import { Padding, Support } from 'ui-core/modal'

export const DiscordSupport = () => {
	const { t } = useTranslation('modals')
	return (
		<>
			<Title />
			<Padding verticalOnly>
				<Support>
					<DiscordOutlineSvg />
					<h4>{t('supportDiscord')}</h4>
					<h1>
						<a href={DiscordSupportURL} target="_blank" rel="noreferrer">
							{t('goToDiscord')} &nbsp;
							<FontAwesomeIcon icon={faExternalLinkAlt} transform="shrink-4" />
						</a>
					</h1>
				</Support>
			</Padding>
		</>
	)
}
