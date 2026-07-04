// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faMinus,
	faPlus,
	faSignOut,
	faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { Odometer } from '@w3ux/react-odometer'
import { minDecimalPlaces, planckToUnit } from '@w3ux/utils'
import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useBalances } from 'hooks/useBalances'
import { useHelp } from 'hooks/useHelp'
import { useNetwork } from 'hooks/useNetwork'
import { useNominatorBondActions } from 'hooks/useNominatorBondActions'
import { usePoolBondActions } from 'hooks/usePoolBondActions'
import { useStaking } from 'hooks/useStaking'
import { BondedChart } from 'library/BarChart/BondedChart'
import { useTranslation } from 'react-i18next'
import { ButtonHelp, ButtonPrimary, MultiButton } from 'ui-buttons'
import { ButtonRow, CardHeader, Loader } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import type { BondConfig, BondManagerProps } from './types'

export const BondManager = ({ bondFor, isPreloading }: BondManagerProps) => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { isBonding } = useStaking()
	const { openHelpTooltip } = useHelp()
	const { openModal } = useOverlay().modal
	const { getStakingLedger } = useBalances()
	const { activeAddress } = useActiveAccount()
	const { isReadOnlyAccount } = useImportedAccounts()
	const { balances } = useAccountBalances(activeAddress)
	const {
		canBond,
		canUnbond,
		canUnstake,
		bondDisabled: nominatorBondDisabled,
	} = useNominatorBondActions()
	const { canLeavePool, bondDisabled: poolBondDisabled } = usePoolBondActions()
	const { units } = getStakingChainData(network)
	const Token = getChainIcons(network).token
	const { ledger } = getStakingLedger(activeAddress)

	const isNominator = bondFor === 'nominator'

	// Determine bond configuration based on bond type
	const bondConfig: BondConfig = isNominator
		? {
				active: ledger?.active || 0n,
				totalUnlocking: balances.nominator.totalUnlocking,
				totalUnlocked: balances.nominator.totalUnlocked,
				bondButtonsDisabled: nominatorBondDisabled,
				bondDisabled: !canBond,
				unbondDisabled: !canUnbond,
				showUnstakeButton: !isReadOnlyAccount(activeAddress) && isBonding,
				unstakeDisabled: !canUnstake,
				unstakeModalKey: 'Unstake',
				unstakeIcon: faSignOutAlt,
				helpKey: 'Bonding',
			}
		: {
				active: balances.pool.active,
				totalUnlocking: balances.pool.totalUnlocking,
				totalUnlocked: balances.pool.totalUnlocked,
				bondButtonsDisabled: poolBondDisabled,
				bondDisabled: poolBondDisabled,
				unbondDisabled: poolBondDisabled,
				showUnstakeButton: canLeavePool,
				unstakeDisabled: false,
				unstakeModalKey: 'LeavePool',
				unstakeIcon: faSignOut,
				helpKey: 'Bonded in Pool',
			}

	const {
		active,
		totalUnlocking,
		totalUnlocked,
		bondButtonsDisabled,
		bondDisabled,
		unbondDisabled,
		showUnstakeButton,
		unstakeDisabled,
		unstakeModalKey,
		unstakeIcon,
		helpKey,
	} = bondConfig

	return (
		<>
			<CardHeader>
				<h4>
					{t('bondedFunds')}
					<ButtonHelp
						marginLeft
						definition={helpKey}
						openHelp={openHelpTooltip}
					/>
				</h4>
				<h2>
					<Token />
					<Odometer
						value={minDecimalPlaces(
							new BigNumber(planckToUnit(active, units)).toFormat(),
							2,
						)}
						zeroDecimals={2}
					/>
				</h2>
				{isPreloading ? (
					<Loader style={{ height: '2.5rem', width: '10rem' }} />
				) : (
					<ButtonRow>
						<MultiButton.Container marginRight disabled={bondButtonsDisabled}>
							<MultiButton.Button
								size="md"
								disabled={bondDisabled}
								marginRight
								onClick={() =>
									openModal({
										key: 'Bond',
										options: { bondFor },
										size: 'sm',
									})
								}
								iconLeft={faPlus}
								text=""
							/>
							{isNominator && <span />}
							<MultiButton.Button
								size="md"
								disabled={unbondDisabled}
								marginRight
								onClick={() =>
									openModal({
										key: 'Unbond',
										options: { bondFor },
										size: 'sm',
									})
								}
								iconLeft={faMinus}
								text=""
							/>
						</MultiButton.Container>
						{showUnstakeButton && (
							<ButtonPrimary
								size="md"
								text={t('unstake')}
								iconLeft={unstakeIcon}
								disabled={unstakeDisabled}
								onClick={() => openModal({ key: unstakeModalKey, size: 'sm' })}
							/>
						)}
					</ButtonRow>
				)}
			</CardHeader>
			<BondedChart
				active={new BigNumber(planckToUnit(active, units))}
				unlocking={new BigNumber(planckToUnit(totalUnlocking, units))}
				unlocked={new BigNumber(planckToUnit(totalUnlocked, units))}
				free={new BigNumber(planckToUnit(balances.transferableBalance, units))}
				inactive={active === 0n}
			/>
		</>
	)
}
