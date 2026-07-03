// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RewardsByValidationNode } from '@polkawatch/ddp-client'
import { Identity } from 'library/ListItem/Labels/Identity'
import { RewardShare } from 'library/ListItem/Labels/RewardShare'
import { Wrapper } from 'library/ListItem/Wrappers'
import { motion } from 'motion/react'
import { LabelRow, Separator } from 'ui-core/list'

export const Node = ({
	node,
	rewardTotal,
}: {
	node: RewardsByValidationNode
	rewardTotal: number
}) => {
	const rewardShare = Math.round((node.TokenRewards / rewardTotal) * 1000) / 10

	return (
		<motion.div
			className="item col"
			variants={{
				hidden: {
					y: 15,
					opacity: 0,
				},
				show: {
					y: 0,
					opacity: 1,
				},
			}}
		>
			<Wrapper className="member">
				<div className="inner">
					<div className="row top">
						<Identity address={node.Id} />
					</div>
					<Separator />
					<div className="row bottom">
						<div>
							<h4 style={{ paddingLeft: '0.25rem', fontSize: '0.95em' }}>
								{node.LastNetwork}, {node.LastCountry}, {node.LastRegion}{' '}
								{node.Countries + node.Regions > 2 ? ', ++' : ''}
							</h4>
						</div>

						<LabelRow>
							<RewardShare share={rewardShare} />
						</LabelRow>
					</div>
				</div>
			</Wrapper>
		</motion.div>
	)
}
