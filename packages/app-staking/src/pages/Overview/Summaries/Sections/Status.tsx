// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useActiveAccountPool } from 'hooks/useActiveAccountPool'
import { useAverageRewardRate } from 'hooks/useAverageRewardRate'
import { useNetwork } from 'hooks/useNetwork'
import { useNextRewards } from 'hooks/useNextRewards'
import { useNominationStatus } from 'hooks/useNominationStatus'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { useTips } from 'hooks/useTips'
import { useWarnings } from 'hooks/useWarnings'
import { Countdown } from 'library/Countdown'
import { Stat } from 'library/Stat'
import { Preloader } from 'library/StatusPreloader/Preloader'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SimpleBar from 'simplebar-react'
import { Badge, ButtonRow, Page } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import { Tips } from 'ui-tips'
import { SectionWrapper, Subheading } from '../Wrappers'

export const Status = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { isBonding } = useStaking()
	const { accountSynced } = useSyncing()
	const { formatted } = useNextRewards()
	const { openModal } = useOverlay().modal
	const { warningMessages } = useWarnings()
	const { activeAddress } = useActiveAccount()
	const { items, getPoolWarningTips } = useTips()
	const { getNominationStatus } = useNominationStatus()
	const { inPool, activePool, membershipDisplay, label } =
		useActiveAccountPool()
	const { getAverageRewardRate, formatRateAsPercent } = useAverageRewardRate()

	const syncing = !accountSynced(activeAddress)
	const poolWarningTips = getPoolWarningTips()
	const nominationStatus = getNominationStatus(activeAddress, 'nominator')
	const notStaking = activeAddress && !isBonding && !inPool

	// Memoize the tips items to avoid recalculation
	const tipsItems = useMemo(
		() => (warningMessages.length ? poolWarningTips : items),
		[warningMessages.length, poolWarningTips, items],
	)

	const Status =
		isBonding && inPool ? (
			<Stat
				label={t('status', { ns: 'pages' })}
				stat={t('nominatingAndInPool', { ns: 'modals' })}
			/>
		) : isBonding ? (
			<Stat
				label={t('status', { ns: 'pages' })}
				stat={nominationStatus.message}
			/>
		) : activePool ? (
			<Stat
				label={label}
				type="address"
				stat={{
					address: activePool?.addresses?.stash ?? '',
					display: membershipDisplay,
				}}
			/>
		) : !activeAddress ? (
			<Stat label={''} stat={t('noAccountSelected', { ns: 'app' })} />
		) : (
			<Stat label={''} stat={t('notStaking', { ns: 'pages' })} />
		)

	return (
		<SectionWrapper>
			<div className="content top hPadding vPadding">
				<Page.RowSection standalone={true} style={{ width: '100%' }}>
					<section>
						{syncing ? (
							<Preloader />
						) : (
							<>
								{Status}
								{notStaking && (
									<Subheading>{t('stakingStats', { ns: 'app' })}</Subheading>
								)}
								<div
									style={{
										position: 'relative',
										width: '100%',
									}}
								>
									<div
										style={{
											position: 'absolute',
											width: '100%',
											left: 0,
										}}
									>
										<SimpleBar autoHide={false} className="thin-scrollbar">
											<ButtonRow
												style={{
													padding: isBonding || inPool ? undefined : '0 0.5rem',
													flexWrap: 'nowrap',
												}}
											>
												{!activeAddress ? (
													<Badge.Container hList format="button">
														<Badge.Inner>
															<button
																type="button"
																onClick={() => openModal({ key: 'Accounts' })}
															>
																{t('selectAccount', { ns: 'app' })}
																<FontAwesomeIcon
																	icon={faChevronRight}
																	transform="shrink-4"
																/>
															</button>
														</Badge.Inner>
													</Badge.Container>
												) : (
													<>
														{warningMessages.map(
															({ value, label, format, faIcon }) => (
																<Badge.Container
																	format={format}
																	hList
																	styled
																	key={value}
																>
																	<Badge.Inner variant={format}>
																		<FontAwesomeIcon icon={faIcon} />
																		{value}
																		{label && <span>{label}</span>}
																	</Badge.Inner>
																</Badge.Container>
															),
														)}
														{warningMessages.length === 0 && (
															<>
																<Badge.Container hList>
																	<Badge.Inner variant="secondary">
																		{formatRateAsPercent(
																			getAverageRewardRate(),
																		)}
																		<span>APY</span>
																	</Badge.Inner>
																</Badge.Container>
																<Badge.Container hList>
																	{t('nextRewardsIn', { ns: 'app' })}
																	<Badge.Inner variant="secondary">
																		<Countdown timeleft={formatted} />
																	</Badge.Inner>
																</Badge.Container>
															</>
														)}
													</>
												)}
											</ButtonRow>
										</SimpleBar>
									</div>
								</div>
							</>
						)}
					</section>
				</Page.RowSection>
			</div>
			<Tips
				items={tipsItems}
				syncing={syncing}
				onPageReset={{ network, activeAddress }}
			/>
		</SectionWrapper>
	)
}
