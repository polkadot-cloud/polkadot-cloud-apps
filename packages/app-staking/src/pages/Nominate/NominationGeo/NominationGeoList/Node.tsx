// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RewardsByValidationNode } from '@polkawatch/ddp-client'
import { Identity } from 'library/ListItem/Labels/Identity'
import { RewardShare } from 'library/ListItem/Labels/RewardShare'
import { motion } from 'motion/react'
import { BasicItem } from 'ui-app/ListItem'
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
			<BasicItem.Root kind="member">
				<BasicItem.Row position="top">
					<Identity address={node.Id} />
				</BasicItem.Row>
				<Separator />
				<BasicItem.Row position="bottom">
					<div>
						<h4 style={{ paddingLeft: '0.25rem', fontSize: '0.95em' }}>
							{node.LastNetwork}, {node.LastCountry}, {node.LastRegion}{' '}
							{node.Countries + node.Regions > 2 ? ', ++' : ''}
						</h4>
					</div>

					<LabelRow>
						<RewardShare share={rewardShare} />
					</LabelRow>
				</BasicItem.Row>
			</BasicItem.Root>
		</motion.div>
	)
}
