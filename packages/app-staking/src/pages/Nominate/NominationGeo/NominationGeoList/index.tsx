// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from 'hooks/useHelp'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { Header, List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer } from 'library/List/MotionContainer'
import { CardHeader } from 'ui-core/base'
import type { NomninationGeoListProps } from '../types'
import { Node } from './Node'

export const NominationGeoList = ({ title, data }: NomninationGeoListProps) => {
	const { openHelpTooltip } = useHelp()

	if (!data?.nodeDistributionDetail) {
		return null
	}

	const rewardTotal = data.nodeDistributionDetail.reduce(
		(acc, n) => acc + n.TokenRewards,
		0,
	)
	return (
		<ListWrapper>
			<Header className="noBorder">
				<div>
					<CardHeader action margin>
						<h3>
							{title}
							<ButtonHelpTooltip
								marginLeft
								definition="Geolocation of Each Nomination"
								openHelp={openHelpTooltip}
							/>
						</h3>
					</CardHeader>
				</div>
			</Header>
			<List $flexBasisLarge={'33.33%'}>
				<MotionContainer>
					{data.nodeDistributionDetail
						.sort((a, b) => b.TokenRewards - a.TokenRewards)
						.map((node) => (
							<Node
								key={`nomination_geo_list_${node.Id}`}
								node={node}
								rewardTotal={rewardTotal}
							/>
						))}
				</MotionContainer>
			</List>
		</ListWrapper>
	)
}
