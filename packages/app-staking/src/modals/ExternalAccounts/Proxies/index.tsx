// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronRight,
	faMinus,
	faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useImportedAccounts } from '@polkadot-cloud/connect'
import { useProxies } from '@polkadot-cloud/connect-proxies'
import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn } from '@w3ux/utils'
import { useHelp } from 'hooks/useHelp'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonMonoInvert, ButtonSecondary } from 'ui-buttons'
import { Padding, Title } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'
import {
	ActionWithButton,
	ManualAccount,
	ManualAccountsWrapper,
} from '../Wrappers'
import { Declare } from './Declare'

export const Proxies = () => {
	const { t } = useTranslation('modals')
	const { openHelpTooltip } = useHelp()
	const { accounts } = useImportedAccounts()
	const { setModalResize } = useOverlay().modal
	const { formatProxiesToDelegates } = useProxies()

	const [inputOpen, setInputOpen] = useState<boolean>(false)

	// Filter delegates to only show those who are imported in the dashboard.
	const delegates = formatProxiesToDelegates()
	const importedDelegates = Object.fromEntries(
		Object.entries(delegates).filter(([delegate]) =>
			accounts.find((a) => a.address === delegate),
		),
	)

	useEffect(() => {
		setModalResize()
	}, [inputOpen, JSON.stringify(delegates)])

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('proxies')}</Title>
				<ActionWithButton>
					<div>
						<FontAwesomeIcon icon={faChevronRight} transform="shrink-4" />
						<h3>{t('proxyAccounts')}</h3>
						<ButtonHelpTooltip
							marginLeft
							definition="Proxy Accounts"
							openHelp={openHelpTooltip}
						/>
					</div>
					<div>
						<ButtonMonoInvert
							iconLeft={inputOpen ? faMinus : faPlus}
							text={!inputOpen ? t('declare') : t('hide')}
							onClick={() => {
								setInputOpen(!inputOpen)
							}}
						/>
					</div>
				</ActionWithButton>
				<ManualAccountsWrapper>
					<div className="content">
						{inputOpen && <Declare />}
						{Object.entries(importedDelegates).length ? (
							<div className="accounts">
								{Object.entries(importedDelegates).map(
									([delegate, delegators]) => (
										<Fragment key={`user_delegate_account_${delegate}`}>
											{delegators.map(({ delegator, proxyType }) => (
												<ManualAccount
													key={`user_delegate_${delegate}_delegator_${delegator}_${proxyType}`}
												>
													<div>
														<Polkicon address={delegate} fontSize="2.4rem" />
														<div className="text">
															<h4 className="title">
																<span>
																	{proxyType} {t('proxy')}
																</span>
																{accounts.find((a) => a.address === delegate)
																	?.name || delegate}
															</h4>
															<h4 className="subtitle">
																{t('for')}{' '}
																<span>{ellipsisFn(delegator, 7)}</span>
															</h4>
														</div>
													</div>
													<div />
													<ButtonSecondary text={t('declared')} disabled />
												</ManualAccount>
											))}
										</Fragment>
									),
								)}
							</div>
						) : (
							<div style={{ padding: '0.5rem' }}>
								<h4>{t('noProxyAccountsDeclared')}</h4>
							</div>
						)}
					</div>
				</ManualAccountsWrapper>
			</Padding>
		</>
	)
}
