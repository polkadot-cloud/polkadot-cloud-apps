// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useSize } from '@w3ux/hooks'
import { getStakingChainData } from 'consts/util/chains'
import { useThemeValues } from 'contexts/ThemeValues'
import { useHalving } from 'hooks/useHalving'
import { useHelp } from 'hooks/useHelp'
import { useNetwork } from 'hooks/useNetwork'
import { useUi } from 'hooks/useUi'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { Countdown } from 'library/Countdown'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from 'ui-core/base'
import { GraphInner } from 'ui-core/canvas'
import { HalvingLine } from 'ui-graphs'
import { formatSize } from 'utils'
import { SectionWrapper, SummaryHeading } from '../Wrappers'

export const Halving = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { timeleft } = useHalving()
	const { containerRefs } = useUi()
	const { openHelpTooltip } = useHelp()
	const { getThemeValue } = useThemeValues()
	const { unit } = getStakingChainData(network)

	const tooltipLabel = (value: number) => {
		const millions = (value / 1_000_000).toFixed(2)
		return `${millions}${t('millionUnit', { ns: 'app' })} ${unit}/${t('year', { ns: 'app' })}`
	}

	const graphInnerRef = useRef<HTMLDivElement>(null)
	const size = useSize(graphInnerRef, {
		outerElement: containerRefs?.mainInterface,
	})
	const { width, height } = formatSize(size, 130)

	return (
		<SectionWrapper>
			<div className="graph">
				<SummaryHeading>
					{t('nextHalving', { ns: 'app' })}:{' '}
					<Badge.Inner>
						<Countdown timeleft={timeleft} />
					</Badge.Inner>
					<ButtonHelpTooltip
						marginLeft
						definition={'Halving'}
						openHelp={openHelpTooltip}
					/>
				</SummaryHeading>
				<div
					style={{
						marginTop: '1rem',
						flex: 1,
						minHeight: 0,
						maxHeight: height,
					}}
				>
					<GraphInner
						width={width}
						height={height}
						noSpacing
						ref={graphInnerRef}
					>
						<HalvingLine
							getThemeValue={getThemeValue}
							label={t('issuance', { ns: 'app' })}
							tooltipLabel={tooltipLabel}
							millionUnit={t('millionUnit', { ns: 'app' })}
						/>
					</GraphInner>
				</div>
			</div>
		</SectionWrapper>
	)
}
