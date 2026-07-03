// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled, { keyframes } from 'styled-components'

const shimmer = keyframes`
	0% { transform: translateX(-100%); }
	100% { transform: translateX(100%); }
`

export const ProgressBarWrapper = styled.div`
	width: 100%;
	margin: 0.75rem 0 0 0;
`

export const ProgressTrack = styled.div`
	position: relative;
	background: var(--btn-bg-secondary);
	border-radius: 0.35rem;
	display: flex;
	overflow: hidden;
	height: 0.7rem;
	width: 100%;
`

export const ProgressFill = styled.div<{
	$progress: number
	$status: 'active' | 'complete'
}>`
	height: 100%;
	width: ${({ $progress }) => $progress}%;
	background: ${({ $status }) =>
		$status === 'complete' ? 'var(--status-success)' : 'var(--gray-1000)'};
	transition: width 1.5s ease-out;
	position: relative;
	overflow: hidden;

	@media (prefers-reduced-motion: reduce) {
		transition: none;
	}

	&::after {
		content: ${({ $status }) => ($status === 'active' ? "''" : 'none')};
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			var(--shade-200) 50%,
			transparent 100%
		);
		animation: ${shimmer} 2.5s ease-in-out infinite;

		@media (prefers-reduced-motion: reduce) {
			animation: none;
		}
	}
`
