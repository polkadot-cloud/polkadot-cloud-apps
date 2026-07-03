// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ProgressBarWrapper, ProgressFill, ProgressTrack } from './Wrappers'

interface ProgressBarProps {
	progress: number
	status?: 'active' | 'complete'
	ariaLabel?: string
}

export const ProgressBar = ({
	progress,
	status = 'active',
	ariaLabel,
}: ProgressBarProps) => {
	const clamped = Math.min(100, Math.max(0, progress))
	const rounded = Math.round(clamped)

	// Visual minimum: always show at least 1% fill width when actively
	// in progress so the bar is visible from the start.
	const visualProgress = status === 'active' ? Math.max(1, clamped) : clamped

	return (
		<ProgressBarWrapper
			role="progressbar"
			aria-valuenow={rounded}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label={ariaLabel || `${rounded}% complete`}
		>
			<ProgressTrack>
				<ProgressFill $progress={visualProgress} $status={status} />
			</ProgressTrack>
		</ProgressBarWrapper>
	)
}
