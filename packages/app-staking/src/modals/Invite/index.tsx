// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faEnvelopeOpenText, faList } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { ProductionURL } from 'consts'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useBalances } from 'hooks/useBalances'
import { useNetwork } from 'hooks/useNetwork'
import { ButtonCopy } from 'library/ButtonCopy'
import { Title } from 'library/Modal/Title'
import { useTranslation } from 'react-i18next'
import { Padding, Support } from 'ui-core/modal'

export const Invite = () => {
	const { network } = useNetwork()
	const { t } = useTranslation()
	const { formatWithPrefs } = useValidators()
	const { activeAddress } = useActiveAccount()
	const { getPoolMembership, getNominations } = useBalances()

	const nominated = formatWithPrefs(getNominations(activeAddress))
	const { membership } = getPoolMembership(activeAddress)
	const poolId = membership?.poolId || 0

	const canCopy = nominated.length > 0 || membership !== undefined

	let toCopy = ''
	let title = ''
	let subtitle = ''
	let faIcon = faEnvelopeOpenText

	if (membership) {
		toCopy = `${ProductionURL}/#/overview?n=${network}&i=pool&id=${poolId}`
		title = t('copyPoolInviteLink', { ns: 'app' })
		subtitle = toCopy
	} else if (nominated.length > 0) {
		faIcon = faList
		toCopy = nominated.map((validator) => validator.address).join('\n')
		title = t('copyNominations', { ns: 'app' })
		subtitle = t('copyValidatorAddresses', { ns: 'app' })
	}

	return (
		<>
			<Title />
			<Padding verticalOnly>
				<Support>
					<FontAwesomeIcon
						icon={faIcon}
						style={{ color: 'var(--gray-1000)' }}
					/>
					{canCopy ? (
						<>
							<ButtonCopy
								value={toCopy}
								size="1rem"
								style={{ marginTop: '1.5rem' }}
							>
								<h2>
									{title}
									&nbsp;
								</h2>
							</ButtonCopy>
							<p>{subtitle}</p>
						</>
					) : (
						<>
							<h2>{title}</h2>
							<p>{t('inviteDescription', { ns: 'app' })}</p>
						</>
					)}
				</Support>
			</Padding>
		</>
	)
}
