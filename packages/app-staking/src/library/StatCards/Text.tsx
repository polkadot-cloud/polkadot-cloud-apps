// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from 'hooks/useHelp'
import { ButtonHelp } from 'ui-buttons'
import { Stat } from 'ui-core/base'
import type { TextProps } from './types'
import { Wrapper } from './Wrapper'

export const Text = ({
	label,
	value,
	helpKey,
	primary,
	isPreloading,
}: TextProps) => {
	const { openHelpTooltip } = useHelp()
	return (
		<Wrapper isPreloading={isPreloading}>
			<Stat.Card>
				<div>
					<Stat.Content>
						<Stat.Title primary={primary}>{value}</Stat.Title>
						<Stat.Subtitle>
							{label}
							{helpKey !== undefined ? (
								<ButtonHelp
									marginLeft
									definition={helpKey}
									openHelp={openHelpTooltip}
								/>
							) : null}
						</Stat.Subtitle>
					</Stat.Content>
				</div>
			</Stat.Card>
		</Wrapper>
	)
}
