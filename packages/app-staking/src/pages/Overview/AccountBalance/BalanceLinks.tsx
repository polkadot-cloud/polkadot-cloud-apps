// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { getSubscanBalanceChainId } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import { useTranslation } from 'react-i18next'
import { ButtonPrimaryInvert } from 'ui-buttons'
import { Separator } from 'ui-core/base'
import { MoreWrapper } from '../Wrappers'

export const BalanceLinks = () => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { activeAddress } = useActiveAccount()

	return (
		<MoreWrapper>
			<Separator />
			<h4>{t('moreResources')}</h4>
			<section>
				<ButtonPrimaryInvert
					lg
					onClick={() =>
						window.open(
							`https://${getSubscanBalanceChainId(network)}.subscan.io/account/${activeAddress}`,
							'_blank',
						)
					}
					iconRight={faExternalLinkAlt}
					iconTransform="shrink-3"
					text="Subscan"
					marginRight
					disabled={!activeAddress}
				/>
			</section>
		</MoreWrapper>
	)
}
