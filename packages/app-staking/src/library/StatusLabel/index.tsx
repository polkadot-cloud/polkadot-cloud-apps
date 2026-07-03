// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActivePool } from 'hooks/useActivePool'
import { useHelp } from 'hooks/useHelp'
import { usePlugins } from 'hooks/usePlugins'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import type { StatusLabelProps } from './types'
import { Wrapper } from './Wrapper'

export const StatusLabel = ({
	backgroundOpacity,
	title,
	helpKey,
	hideIcon,
	statusFor,
	topOffset = '40%',
	status = 'sync_or_setup',
}: StatusLabelProps) => {
	const { syncing } = useSyncing()
	const { plugins } = usePlugins()
	const { inPool } = useActivePool()
	const { isBonding } = useStaking()
	const { openHelpTooltip } = useHelp()

	// syncing or not staking
	if (status === 'sync_or_setup') {
		if (syncing || isBonding || inPool) {
			return null
		}
	}

	if (status === 'active_service' && statusFor) {
		if (plugins.includes(statusFor)) {
			return null
		}
	}

	return (
		<Wrapper $backgroundOpacity={backgroundOpacity} $topOffset={topOffset}>
			<div>
				{!hideIcon && <FontAwesomeIcon icon={faExclamationTriangle} />}
				<h2>
					&nbsp;&nbsp;
					{title}
					{helpKey ? (
						<span>
							<ButtonHelpTooltip
								marginLeft
								definition={helpKey}
								openHelp={openHelpTooltip}
								background="secondary"
							/>
						</span>
					) : null}
				</h2>
			</div>
		</Wrapper>
	)
}
