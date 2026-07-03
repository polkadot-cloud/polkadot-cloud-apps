// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Popover } from 'radix-ui'
import styled from 'styled-components'

export const PopoverContent = styled(Popover.Content)`
	background: var(--bg-primary);
	border: 1px solid var(--gray-500);
	border-radius: 1.25rem;
	padding: 1.25rem 1.5rem;
	max-width: 450px;
	box-shadow: 0 4px 4px rgba(0, 0, 0, 0.05);
	z-index: 99;
	position: relative;

	animation-duration: 0.25s;
	animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);

	&[data-state='open'] {
		animation-name: fadeInSpring;
	}

	&[data-state='closed'] {
		animation-name: fadeOut;
	}

	@keyframes fadeInSpring {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes fadeOut {
		from {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
		to {
			opacity: 0;
			transform: scale(0.98) translateY(-2px);
		}
	}

	h4 {
		margin: 0 0 0.75rem 0;
		color: var(--gray-1000);
		font-size: 1.2rem;
	}

	p {
		margin: 0;
		color: var(--gray-900);
		font-size: 1.1rem;
		line-height: 1.5;

		&:not(:last-child) {
			margin-bottom: 0.75rem;
		}
	}
`

export const CloseButton = styled.button`
	position: absolute;
	top: 0.75rem;
	right: 0.75rem;
	background: transparent;
	border: none;
	color: var(--text-tertiary);
	cursor: pointer;
	padding: 0.25rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 0.5rem;
	transition: all 0.15s ease;
	font-size: 1rem;

	&:hover {
		color: var(--gray-1000);
	}

	&:active {
		transform: scale(0.95);
	}
`
