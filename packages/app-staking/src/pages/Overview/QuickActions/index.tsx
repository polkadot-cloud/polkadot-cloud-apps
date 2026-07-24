// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useActivePool } from 'hooks/useActivePool'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { CardWrapper } from 'library/Card/Wrappers'
import { Preloader } from 'library/StatusPreloader/Preloader'
import { useTranslation } from 'react-i18next'
import { QuickAction } from 'ui-buttons'
import { CardHeader } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import { Disconnected } from './Disconnected'
import { NotStaking } from './NotStaking'
import { Staking } from './Staking'

export const QuickActions = ({ height }: { height: number }) => {
	const { t } = useTranslation()
	const { inPool } = useActivePool()
	const { isBonding } = useStaking()
	const { accountSynced } = useSyncing()
	const { openModal } = useOverlay().modal
	const { activeAddress } = useActiveAccount()

	const isStaking = inPool || isBonding
	const syncing = !accountSynced(activeAddress)

	let actionGroup: 'disconnected' | 'notStaking' | 'staking' = 'staking'
	if (!activeAddress) {
		actionGroup = 'disconnected'
	} else if (!isStaking) {
		actionGroup = 'notStaking'
	}

	return (
		<CardWrapper style={{ padding: 0 }} height={height}>
			<CardHeader style={{ padding: '1.25rem 1.25rem 0 1.25rem' }}>
				<h4>{t('quickActions', { ns: 'pages' })}</h4>
			</CardHeader>
			{syncing ? (
				<QuickAction.Container>
					<section style={{ width: '100%', padding: '0.25rem' }}>
						<Preloader />
					</section>
				</QuickAction.Container>
			) : (
				<>
					{actionGroup === 'disconnected' && <Disconnected />}
					{actionGroup === 'notStaking' && <NotStaking />}
					{actionGroup === 'staking' && (
						<Staking
							bondFor={[
								...(inPool ? (['pool'] as const) : []),
								...(isBonding ? (['nominator'] as const) : []),
							]}
						/>
					)}
				</>
			)}
			<QuickAction.Footer>
				<h4>{t('supportChannels', { ns: 'app' })}</h4>
				<section>
					<QuickAction.FooterButton
						icon={faDiscord}
						label="Discord"
						onClick={() => openModal({ key: 'DiscordSupport', size: 'sm' })}
					/>
					<QuickAction.FooterButton
						icon={faEnvelope}
						label={t('email', { ns: 'app' })}
						onClick={() => openModal({ key: 'MailSupport', size: 'sm' })}
					/>
				</section>
			</QuickAction.Footer>
		</CardWrapper>
	)
}
