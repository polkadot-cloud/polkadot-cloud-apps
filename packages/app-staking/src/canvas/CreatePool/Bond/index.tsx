// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import BigNumber from 'bignumber.js'
import { usePoolSetups } from 'hooks/usePoolSetups'
import { useTxMeta } from 'hooks/useTxMeta'
import { BondFeedback } from 'library/Form/Bond/BondFeedback'
import { CreatePoolStatusBar } from 'library/Form/CreatePoolStatusBar'
import { Footer } from 'library/SetupSteps/Footer'
import { Header } from 'library/SetupSteps/Header'
import { MotionContainer } from 'library/SetupSteps/MotionContainer'
import type { SetupStepProps } from 'library/SetupSteps/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Bond = ({ section }: SetupStepProps) => {
	const { t } = useTranslation('pages')
	const { getTxSubmissionByTag } = useTxMeta()
	const { activeAddress } = useActiveAccount()
	const { getPoolSetup, setPoolSetup } = usePoolSetups()

	const txSubmission = getTxSubmissionByTag('createPool')
	const fee = txSubmission?.fee ?? 0n

	const setup = getPoolSetup(activeAddress)
	const { progress } = setup

	// either free to bond or existing setup value
	const bond = progress.bond === '0' ? '' : progress.bond

	// bond valid
	const [bondValid, setBondValid] = useState(false)

	// handler for updating bond
	const handleBondChange = (value: string) => {
		setPoolSetup({
			...progress,
			bond: value,
		})
	}

	const bondValue = new BigNumber(bond || '0')

	return (
		<>
			<Header
				thisSection={section}
				complete={bond !== ''}
				title={t('bond')}
				bondFor="pool"
			/>
			<MotionContainer thisSection={section} activeSection={setup.section}>
				<BondFeedback
					value={bond}
					onChange={handleBondChange}
					syncing={fee === 0n}
					bondFor="pool"
					listenIsValid={setBondValid}
					txFees={fee}
					maxWidth
					displayFor="canvas"
				/>
				<CreatePoolStatusBar value={bondValue} />
				<Footer complete={bondValid} bondFor="pool" />
			</MotionContainer>
		</>
	)
}
