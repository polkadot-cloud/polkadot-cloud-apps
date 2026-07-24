// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHelp } from 'hooks/useHelp'
import { Announcement as AnnouncementLoader } from 'library/Loader/Announcement'
import { ButtonHelp, ButtonTertiary } from 'ui-buttons'
import type { AnnouncementItem } from './types'
import { AnnouncementsContainer, Item } from './Wrappers'

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
		},
	},
}

const listItem = {
	hidden: { opacity: 0 },
	show: { opacity: 1 },
}

export const AnnouncementsList = ({
	items,
	grouped,
}: {
	items?: Array<AnnouncementItem | null>
	grouped?: Record<string, Array<AnnouncementItem | null>>
}) => {
	const { openHelpTooltip } = useHelp()

	const renderItem = (item: AnnouncementItem | null, key: string) =>
		item === null ? (
			<AnnouncementLoader key={key} />
		) : (
			<Item
				key={key}
				variants={listItem}
				className={item.valueNode ? 'value-node-layout' : undefined}
			>
				{item.valueNode ? (
					<>
						<h4>
							{item.label}
							{item.helpKey && (
								<ButtonHelp
									marginLeft
									definition={item.helpKey}
									openHelp={openHelpTooltip}
								/>
							)}
						</h4>
						<div className="value-node">{item.valueNode}</div>
					</>
				) : (
					<>
						<h2>
							{item.icon && <FontAwesomeIcon icon={item.icon} />}
							{item.value}
							{item.button && (
								<ButtonTertiary
									text={item.button.text}
									onClick={() => item.button?.onClick()}
									disabled={item.button.disabled}
								/>
							)}
						</h2>
						{item.secondaryValue && <h3>{item.secondaryValue}</h3>}
					</>
				)}
				{!item.valueNode && (
					<h4>
						{item.label}
						{item.helpKey && (
							<ButtonHelp
								marginLeft
								definition={item.helpKey}
								openHelp={openHelpTooltip}
							/>
						)}
					</h4>
				)}
			</Item>
		)

	return (
		<AnnouncementsContainer
			variants={container}
			initial="hidden"
			animate="show"
		>
			{grouped ? (
				Object.entries(grouped).map(([category, categoryItems]) => (
					<div key={category} className="category-section">
						<h2 className="category-header">{category}</h2>
						<div className="category-items">
							{categoryItems.map((item, index) =>
								renderItem(item, `announcement_${category}_${index}`),
							)}
						</div>
					</div>
				))
			) : (
				<div className="category-section">
					<div className="category-items">
						{(items || []).map((item, index) =>
							renderItem(item, `announcement_${index}`),
						)}
					</div>
				</div>
			)}
		</AnnouncementsContainer>
	)
}
