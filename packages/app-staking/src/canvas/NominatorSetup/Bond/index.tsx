// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import BigNumber from 'bignumber.js'
import { useNominatorSetups } from 'contexts/NominatorSetups'
import { useTxMeta } from 'hooks/useTxMeta'
import { BondFeedback } from 'library/Form/Bond/BondFeedback'
import { NominateStatusBar } from 'library/Form/NominateStatusBar'
import { Footer } from 'library/SetupSteps/Footer'
import { Header } from 'library/SetupSteps/Header'
import { MotionContainer } from 'library/SetupSteps/MotionContainer'
import type { SetupStepProps } from 'library/SetupSteps/types'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Bond = ({
	section,
	inline,
	handleBondValid,
}: SetupStepProps & {
	inline?: boolean
	handleBondValid?: (valid: boolean) => void
}) => {
	const { t } = useTranslation('pages')
	const { getTxSubmissionByTag } = useTxMeta()
	const { activeAddress } = useActiveAccount()
	const { getNominatorSetup, setNominatorSetup } = useNominatorSetups()
	const setup = getNominatorSetup(activeAddress)
	const { progress } = setup

	const txSubmission = getTxSubmissionByTag('nominatorSetup')
	const fee = txSubmission?.fee || 0n

	// either free to bond or existing setup value
	const initialBondValue = progress.bond || '0'

	// store local bond amount for form control
	const [bond, setBond] = useState<{ bond: string }>({
		bond: initialBondValue,
	})

	// bond valid
	const [bondValid, setBondValidState] = useState<boolean>(false)

	// handler for bond valid
	const setBondValid = (valid: boolean) => {
		setBondValidState(valid)
		if (handleBondValid) {
			handleBondValid(valid)
		}
	}

	// handler for updating bond
	const handleSetBond = ({
		value,
		inputValue,
	}: {
		value: BigNumber
		inputValue?: string
	}) => {
		const fixedValue = inputValue ?? value.toFixed()
		// set this form's bond value
		setBond({
			bond: fixedValue,
		})
		// set nominator progress bond value
		setNominatorSetup({
			...progress,
			bond: fixedValue,
		})
	}

	// update bond on account change
	useEffect(() => {
		setBond({
			bond: initialBondValue,
		})
	}, [activeAddress])

	// apply initial bond value to setup progress
	useEffect(() => {
		// only update if Bond is currently active
		if (setup.section === section) {
			setNominatorSetup({
				...progress,
				bond: initialBondValue,
			})
		}
	}, [setup.section])

	return (
		<>
			<Header
				thisSection={section}
				complete={
					inline ? false : progress.bond !== '0' && progress.bond !== ''
				}
				title={t('bond')}
				bondFor="nominator"
			/>
			<MotionContainer thisSection={section} activeSection={setup.section}>
				<BondFeedback
					syncing={fee === 0n}
					bondFor="nominator"
					bonding={false}
					listenIsValid={(valid) => setBondValid(valid)}
					defaultBond={initialBondValue}
					setters={[handleSetBond]}
					txFees={fee}
					maxWidth
					displayFor="canvas"
				/>
				<NominateStatusBar value={new BigNumber(bond.bond || '0')} />
				{!inline && <Footer complete={bondValid} bondFor="nominator" />}
			</MotionContainer>
		</>
	)
}
