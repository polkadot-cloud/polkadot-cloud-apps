// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useBalances } from 'hooks/useBalances'
import { useStaking } from 'hooks/useStaking'
import { useNominatorStats } from 'hooks/useStats'
import { useSyncing } from 'hooks/useSyncing'
import { BondManager } from 'library/BondManager'
import { CardWrapper } from 'library/Card/Wrappers'
import { Nominations } from 'library/Nominations'
import { Empty } from 'library/Nominations/Empty'
import { Stats } from 'library/Stats'
import { useTranslation } from 'react-i18next'
import { Page, Stat } from 'ui-core/base'
import { CommissionPrompt } from './CommissionPrompt'
import { Status } from './Status'
import { UnstakePrompts } from './UnstakePrompts'

export const Active = () => {
	const { t } = useTranslation()
	const { syncing } = useSyncing()
	const { isBonding } = useStaking()
	const { getNominations } = useBalances()
	const { formatWithPrefs } = useValidators()
	const { activeAddress } = useActiveAccount()
	const { activeNominators, minimumNominatorBond, minimumActiveStake } =
		useNominatorStats()

	const nominated = formatWithPrefs(getNominations(activeAddress))
	const ROW_HEIGHT = 220

	return (
		<>
			<Stat.Row>
				<Stats
					items={[activeNominators, minimumNominatorBond, minimumActiveStake]}
				/>
			</Stat.Row>
			<CommissionPrompt />
			<UnstakePrompts />
			<Page.Row>
				<Page.RowSection secondary vLast>
					<CardWrapper height={ROW_HEIGHT}>
						<BondManager bondFor="nominator" />
					</CardWrapper>
				</Page.RowSection>
				<Page.RowSection hLast>
					<Status height={ROW_HEIGHT} />
				</Page.RowSection>
			</Page.Row>
			{isBonding && (
				<Page.Row>
					<CardWrapper>
						{nominated?.length || syncing ? (
							<Nominations bondFor="nominator" nominator={activeAddress} />
						) : (
							<Empty
								bondFor="nominator"
								nominator={activeAddress}
								nominated={nominated}
								disabled={syncing}
								title={t('nominate', { ns: 'pages' })}
							/>
						)}
					</CardWrapper>
				</Page.Row>
			)}
		</>
	)
}
