// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faExclamationTriangle,
	type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { useWarnings } from 'hooks/useWarnings'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from 'ui-app/Card'
import { ButtonSecondary } from 'ui-buttons'
import { Halving } from './Sections/Halving'
import { Status } from './Sections/Status'
import { SectionNav, SectionsArea } from './Wrappers'

interface SummariesProps {
	height: number
}

export const Summaries = ({ height }: SummariesProps) => {
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
		ReactNode,
	][] = []

	// Warnings only show after syncing
	const showWarning = warningMessages.length && !syncing

	// Indicate warnings on the existing Status section
	const statusSectionConfig = showWarning
		? {
				label: t('status', { ns: 'app' }),
				faIcon: faExclamationTriangle,
			}
		: { label: t('status', { ns: 'app' }) }

	sections.push([statusSectionConfig, <Status />])

	// Add the Halving section when available
	if (showHalving) {
		sections.push([
			{
				label: t('nextHalving', { ns: 'app' }),
			},
			<Halving />,
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
				{sections.map(([{ label }, content]) => (
					<div className="section" key={label}>
						{content}
					</div>
				))}
			</SectionsArea>
		</CardWrapper>
	)
}
