// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronRight,
	faMinus,
	faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	useExternalAccounts,
	useImportedAccounts,
} from '@polkadot-cloud/connect'
import { Polkicon } from '@w3ux/react-polkicon'
import { useHelp } from 'hooks/useHelp'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExternalAccount } from 'types'
import { ButtonHelp, ButtonMonoInvert, ButtonSecondary } from 'ui-buttons'
import { Padding, Title } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'
import {
	ActionWithButton,
	ManualAccount,
	ManualAccountsWrapper,
} from '../Wrappers'
import { Add } from './Add'

export const ReadOnly = () => {
	const { t } = useTranslation('modals')
	const { openHelpTooltip } = useHelp()
	const { accounts } = useImportedAccounts()
	const { setModalResize } = useOverlay().modal
	const { forgetExternalAccounts } = useExternalAccounts()

	const [inputOpen, setInputOpen] = useState<boolean>(false)

	// Get all external accounts
	const externalAccountsOnly = accounts.filter(
		({ source }) => source === 'external',
	) as ExternalAccount[]

	// Get external accounts added by user
	const externalAccounts = externalAccountsOnly.filter(
		({ addedBy }) => addedBy === 'user',
	)

	// Forget the account from state only if it has not been replaced by a `system` external account
	const handleForgetUserAccount = (account: ExternalAccount) => {
		if (account.addedBy === 'user') {
			forgetExternalAccounts([account])
		}
		setModalResize()
	}

	useEffect(() => {
		setModalResize()
	}, [inputOpen, JSON.stringify(externalAccounts)])

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('readOnly')}</Title>
				<ActionWithButton>
					<div>
						<FontAwesomeIcon icon={faChevronRight} transform="shrink-4" />
						<h3>{t('readOnlyAccounts')}</h3>
						<ButtonHelp
							marginLeft
							definition="Read Only Accounts"
							openHelp={openHelpTooltip}
						/>
					</div>
					<div>
						<ButtonMonoInvert
							iconLeft={inputOpen ? faMinus : faPlus}
							text={!inputOpen ? t('add') : t('hide')}
							onClick={() => {
								setInputOpen(!inputOpen)
							}}
						/>
					</div>
				</ActionWithButton>
				<ManualAccountsWrapper>
					<div className="content">
						{inputOpen && <Add />}
						{externalAccounts.length ? (
							<div className="accounts">
								{externalAccounts.map((a) => (
									<ManualAccount key={`user_external_account_${a.address}`}>
										<div>
											<Polkicon address={a.address} fontSize="1.9rem" />
											<div className="text">
												<h4>{a.address}</h4>
											</div>
										</div>
										<ButtonSecondary
											text={t('forget')}
											onClick={() => handleForgetUserAccount(a)}
										/>
									</ManualAccount>
								))}
							</div>
						) : (
							<div style={{ padding: '0.5rem' }}>
								<h4>{t('noReadOnlyAdded')}</h4>
							</div>
						)}
					</div>
				</ManualAccountsWrapper>
			</Padding>
		</>
	)
}
