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
import { useCallback, useState } from 'react'
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
	const fee = txSubmission?.fee ?? 0n

	// either free to bond or existing setup value
	const bond = !progress.bond || progress.bond === '0' ? '' : progress.bond

	// bond valid
	const [bondValid, setBondValidState] = useState(false)

	// handler for bond valid
	const setBondValid = useCallback(
		(valid: boolean) => {
			setBondValidState(valid)
			handleBondValid?.(valid)
		},
		[handleBondValid],
	)

	// handler for updating bond
	const handleBondChange = (value: string) => {
		setNominatorSetup({
			...progress,
			bond: value,
		})
	}

	return (
		<>
			<Header
				thisSection={section}
				complete={!inline && bond !== ''}
				title={t('bond')}
				bondFor="nominator"
			/>
			<MotionContainer thisSection={section} activeSection={setup.section}>
				<BondFeedback
					value={bond}
					onChange={handleBondChange}
					syncing={fee === 0n}
					bondFor="nominator"
					listenIsValid={setBondValid}
					txFees={fee}
					maxWidth
					displayFor="canvas"
				/>
				<NominateStatusBar value={new BigNumber(bond || '0')} />
				{!inline && <Footer complete={bondValid} bondFor="nominator" />}
			</MotionContainer>
		</>
	)
}
