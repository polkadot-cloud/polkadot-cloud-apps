// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useWarnings } from 'hooks/useWarnings'
import { Page, StatusCard } from 'ui-core/base'

export const PageWarnings = () => {
	const { warningMessages } = useWarnings()

	return (
		<>
			{warningMessages.map(({ value, label, description, format, faIcon }) => (
				<Page.Row yMargin="compact" key={value}>
					<Page.RowSection standalone>
						<StatusCard
							icon={faIcon}
							iconFrame={false}
							status={format}
							role="status"
						>
							{description}
							{label && ` ${label}`}
						</StatusCard>
					</Page.RowSection>
				</Page.Row>
			))}
		</>
	)
}
