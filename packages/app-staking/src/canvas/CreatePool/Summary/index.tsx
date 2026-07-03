// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { unitToPlanck } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBatchCall } from 'hooks/useBatchCall'
import { useNetwork } from 'hooks/useNetwork'
import { usePoolSetups } from 'hooks/usePoolSetups'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { Warning } from 'library/Form/Warning'
import { Header } from 'library/SetupSteps/Header'
import { MotionContainer } from 'library/SetupSteps/MotionContainer'
import type { SetupStepProps } from 'library/SetupSteps/types'
import { SubmitTx } from 'library/SubmitTx'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'
import { SummaryWrapper } from './Wrapper'

export const Summary = ({ section }: SetupStepProps) => {
	const { t } = useTranslation('pages')
	const {
		serviceApi,
		poolsConfig: { lastPoolId },
	} = useApi()
	const { network } = useNetwork()
	const { newBatchCall } = useBatchCall()
	const { activeProxy } = useActiveProxy()
	const { closeCanvas } = useOverlay().canvas
	const { accountHasSigner } = useImportedAccounts()
	const { getPoolSetup, removePoolSetup } = usePoolSetups()
	const { queryBondedPool, addToBondedPools } = useBondedPools()
	const { activeAddress, activeAccount } = useActiveAccount()
	const { unit, units } = getStakingChainData(network)

	const poolId = lastPoolId + 1
	const setup = getPoolSetup(activeAddress)
	const { progress } = setup

	const { metadata, bond, roles, nominations } = progress

	const getTx = () => {
		if (!activeAddress) {
			return
		}
		const tx = serviceApi.tx.createPool(
			activeAddress,
			poolId,
			unitToPlanck(bond, units),
			metadata,
			nominations.map(({ address }) => address),
			roles,
		)
		if (!tx) {
			return
		}
		return newBatchCall(tx, activeAddress, activeProxy)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tag: 'createPool',
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: true,
		callbackInBlock: async () => {
			// Close canvas.
			closeCanvas()

			// Query and add created pool to bondedPools list.
			const pool = await queryBondedPool(poolId)
			if (pool) {
				addToBondedPools(pool)
			}

			// Reset setup progress
			removePoolSetup(activeAddress)
		},
	})

	return (
		<>
			<Header
				thisSection={section}
				complete={null}
				title={t('summary')}
				bondFor="pool"
			/>
			<MotionContainer thisSection={section} activeSection={setup.section}>
				{!(
					accountHasSigner(activeAccount) || accountHasSigner(activeProxy)
				) && <Warning text={t('readOnly')} />}
				<SummaryWrapper>
					<section>
						<div>
							<FontAwesomeIcon icon={faCheckCircle} transform="grow-1" /> &nbsp;{' '}
							{t('poolName')}:
						</div>
						<div>{metadata ?? `${t('notSet')}`}</div>
					</section>
					<section>
						<div>
							<FontAwesomeIcon icon={faCheckCircle} transform="grow-1" /> &nbsp;{' '}
							{t('bondAmount')}:
						</div>
						<div>
							{new BigNumber(bond || 0).toFormat()} {unit}
						</div>
					</section>
					<section>
						<div>
							<FontAwesomeIcon icon={faCheckCircle} transform="grow-1" /> &nbsp;
							{t('nominating')}:
						</div>
						<div>{t('validatorCount', { count: nominations.length })}</div>
					</section>
					<section>
						<div>
							<FontAwesomeIcon icon={faCheckCircle} transform="grow-1" /> &nbsp;{' '}
							{t('roles')}:
						</div>
						<div>{t('assigned')}</div>
					</section>
				</SummaryWrapper>
				<div
					style={{
						flex: 1,
						width: '100%',
						borderRadius: '1rem',
						overflow: 'hidden',
					}}
				>
					<SubmitTx
						submitText={t('createPool')}
						valid
						stacked
						{...submitExtrinsic}
						displayFor="canvas" /* Edge case: not canvas, but the larger button sizes suit this UI more. */
					/>
				</div>
			</MotionContainer>
		</>
	)
}
