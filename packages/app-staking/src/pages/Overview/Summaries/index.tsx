// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faExclamationTriangle,
	type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { useWarnings } from 'hooks/useWarnings'
import { CardWrapper } from 'library/Card/Wrappers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSecondary } from 'ui-buttons'
import { Halving } from './Sections/Halving'
import { Status } from './Sections/Status'
import { SectionNav, SectionsArea } from './Wrappers'

export const Summaries = ({ height }: { height: number }) => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { accountSynced } = useSyncing()
	const { warningMessages } = useWarnings()
	const { activeAddress } = useActiveAccount()

	const syncing = !accountSynced(activeAddress)

	// State to track active section
	const [activeSection, setActiveSection] = useState<number>(0)

	// Halving section is only for Polkadot network
	const showHalving: boolean = network === 'polkadot'

	// Sections to render
	const sections: [
		{ label: string; faIcon?: IconDefinition; format?: 'warning' | 'danger' },
		React.FC,
	][] = []

	const showWarning = warningMessages.length && !syncing

	const statusSectionConfig = showWarning
		? {
				label: t('status', { ns: 'app' }),
				faIcon: faExclamationTriangle,
			}
		: { label: t('status', { ns: 'app' }) }

	sections.push([statusSectionConfig, Status])

	if (showHalving) {
		sections.push([
			{
				label: t('nextHalving', { ns: 'app' }),
			},
			Halving,
		])
	}

	return (
		<CardWrapper style={{ padding: 0 }} height={height}>
			<SectionNav>
				{sections.map(([{ label, faIcon, format }], index) => (
					<ButtonSecondary
						size="md"
						key={label}
						text={label}
						variant={format}
						onClick={() => setActiveSection(index)}
						active={activeSection === index}
						iconLeft={faIcon}
						asTab
					/>
				))}
			</SectionNav>
			<SectionsArea
				$activeSection={activeSection}
				$totalSections={sections.length}
			>
				{sections.map(([{ label }, Component]) => (
					<div className="section" key={label}>
						<Component />
					</div>
				))}
			</SectionsArea>
		</CardWrapper>
	)
}
