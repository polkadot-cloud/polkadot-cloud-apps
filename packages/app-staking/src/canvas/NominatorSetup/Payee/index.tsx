// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useNominatorSetups } from 'contexts/NominatorSetups'
import type { PayeeOption } from 'contexts/NominatorSetups/types'
import { usePayeeConfig } from 'hooks/usePayeeConfig'
import { Spacer } from 'library/Form/Wrappers'
import { PayeeInput } from 'library/PayeeInput'
import { SelectItems } from 'library/SelectItems'
import { SelectItem } from 'library/SelectItems/Item'
import { Footer } from 'library/SetupSteps/Footer'
import { Header } from 'library/SetupSteps/Header'
import { MotionContainer } from 'library/SetupSteps/MotionContainer'
import type { SetupStepProps } from 'library/SetupSteps/types'
import { Subheading } from 'pages/Nominate/Wrappers'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MaybeAddress } from 'types'

export const Payee = ({ section }: SetupStepProps) => {
	const { t } = useTranslation('pages')
	const { getPayeeItems } = usePayeeConfig()
	const { activeAddress } = useActiveAccount()
	const { getNominatorSetup, setNominatorSetup } = useNominatorSetups()

	const setup = getNominatorSetup(activeAddress)
	const { progress } = setup
	const { payee } = progress

	// Store the current user-inputted custom payout account.
	const [account, setAccount] = useState<MaybeAddress>(payee.account)

	// determine whether this section is completed.
	const isComplete = () =>
		payee.destination !== null &&
		!(payee.destination === 'Account' && payee.account === null)

	// update setup progress with payee config.
	const handleChangeDestination = (destination: PayeeOption) => {
		// set local value to update input element set setup payee
		setNominatorSetup({
			...progress,
			payee: { destination, account },
		})
	}

	// update setup progress with payee account.
	const handleChangeAccount = (newAccount: MaybeAddress) => {
		// set local value to update input element set setup payee
		setNominatorSetup({
			...progress,
			payee: { ...payee, account: newAccount },
		})
	}

	// set initial payee value to `Staked` if not yet set.
	useEffect(() => {
		if (!payee || (!payee.destination && !payee.account)) {
			setNominatorSetup({
				...progress,
				payee: {
					destination: 'Staked',
					account: null,
				},
			})
		}
	}, [activeAddress])

	return (
		<>
			<Header
				thisSection={section}
				complete={isComplete()}
				title={t('payoutDestination')}
				bondFor="nominator"
			/>
			<MotionContainer thisSection={section} activeSection={setup.section}>
				<Subheading>
					<h4>{t('payoutDestinationSubtitle')}</h4>
				</Subheading>

				<SelectItems layout="three-col">
					{getPayeeItems().map((item) => (
						<SelectItem
							key={`payee_option_${item.value}`}
							account={account}
							setAccount={setAccount}
							selected={payee.destination === item.value}
							onClick={() => handleChangeDestination(item.value)}
							layout="three-col"
							{...item}
							icon={<FontAwesomeIcon icon={item.icon} />}
						/>
					))}
				</SelectItems>
				<Spacer />
				<PayeeInput
					payee={payee}
					account={account}
					setAccount={setAccount}
					handleChange={handleChangeAccount}
				/>
				<Footer complete={isComplete()} bondFor="nominator" />
			</MotionContainer>
		</>
	)
}
