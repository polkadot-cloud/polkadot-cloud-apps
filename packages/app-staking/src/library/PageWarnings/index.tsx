// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWarnings } from 'hooks/useWarnings'
import { Badge, Page } from 'ui-core/base'

export const PageWarnings = () => {
	const { warningMessages } = useWarnings()

	return (
		<>
			{warningMessages.length > 0 && (
				<Page.Row yMargin>
					<Page.RowSection standalone>
						{warningMessages.map(
							({ value, label, description, format, faIcon }) => (
								<Badge.Container format={format} styled vList key={value}>
									<Badge.Inner variant={format}>
										<FontAwesomeIcon icon={faIcon} />
										{description}
										{label && <span>{label}</span>}
									</Badge.Inner>
								</Badge.Container>
							),
						)}
					</Page.RowSection>
				</Page.Row>
			)}
		</>
	)
}
