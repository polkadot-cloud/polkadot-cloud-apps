// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from 'hooks/useHelp'
import { Stat } from 'ui-app/Stat'
import { ButtonHelp } from 'ui-buttons'
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
				<Stat.Content>
					<Stat.Title text={value} primary={primary} />
					<Stat.Subtitle text={label}>
						{helpKey !== undefined ? (
							<ButtonHelp
								marginLeft
								definition={helpKey}
								openHelp={openHelpTooltip}
							/>
						) : null}
					</Stat.Subtitle>
				</Stat.Content>
			</Stat.Card>
		</Wrapper>
	)
}
