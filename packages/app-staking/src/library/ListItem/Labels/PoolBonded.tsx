// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import { useTooltip } from 'hooks/useTooltip'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { TooltipArea } from 'ui-core/base'
import { Label } from 'ui-core/list'
import { planckToUnitBn } from 'utils'

export const PoolBonded = ({ pool }: { pool: BondedPool }) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { setTooltipTextAndOpen } = useTooltip()
	const { units } = getStakingChainData(network)

	const tooltipText = t('bonded')
	const { points } = pool
	const Token = getChainIcons(network).token

	// Format total bonded pool amount.
	const bonded = planckToUnitBn(new BigNumber(points), units)

	return (
		<Label>
			<TooltipArea
				text={tooltipText}
				onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
			/>

			<Token
				style={{
					maxWidth: '1.25rem',
					height: '1.25rem',
					marginRight: '0.25rem',
				}}
			/>
			{bonded.decimalPlaces(0).toFormat()}
		</Label>
	)
}
