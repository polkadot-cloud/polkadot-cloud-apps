// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'
import { CardWrapper } from 'ui-app/Card'
import { Loader } from 'ui-core/base'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;

  > div:last-child {
    width: 100%;
  }
`

export const StandaloneCards = styled(Wrapper)`
  flex-flow: column nowrap;

  > ${CardWrapper} {
    flex: 0 0 auto;
    width: 100%;

    &.transparent {
      overflow: visible;
    }
  }
`

export const NominationsLoader = styled(Loader)<{ $standalone?: boolean }>`
  ${({ $standalone }) =>
		$standalone &&
		`
    .light & {
      --shimmer-fg: var(--gray-400);
      --shimmer-bg: var(--gray-500);
    }

    .dark & {
      --shimmer-fg: var(--gray-300);
      --shimmer-bg: var(--gray-500);
    }
  `}
`

export const AccountPrompt = styled.section`
	align-items: center;
	display: flex;
	flex-flow: column nowrap;
	gap: 0.6rem;
	justify-content: center;
	margin-top: 1.4rem;
	min-height: 13rem;
	padding: 2rem 1rem;
	text-align: center;

	h3 {
		font-size: 1.5rem;
		line-height: 1.25;
		margin: 0;
	}

	p {
		color: var(--text-tertiary);
		font-size: 1.2rem;
		line-height: 1.45;
		margin: -0.2rem 0 0.2rem;
	}
`

export const AccountPromptGraphic = styled.div<{
	$status: 'disconnected' | 'notStaking'
}>`
	${({ $status }) =>
		$status === 'notStaking'
			? `
				--prompt-accent: var(--status-warning);
			`
			: `
				--prompt-accent: var(--accent-800);
			`}

	align-items: center;
	background: var(--gray-300);
	border: 1px solid var(--gray-500);
	border-radius: 50%;
	color: var(--gray-900);
	display: flex;
	font-size: 2.25rem;
	height: 5.5rem;
	justify-content: center;
	margin-bottom: 0.65rem;
	position: relative;
	width: 5.5rem;

	&::after {
		background: var(--prompt-accent);
		border: 0.25rem solid var(--bg-body);
		border-radius: 50%;
		bottom: 0.1rem;
		content: '';
		height: 1rem;
		position: absolute;
		right: 0.1rem;
		width: 1rem;
	}
`

export const AccountPromptAction = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;

	> span {
		margin-left: 0;
		margin-right: 0;
	}
`

export const NominationHealthWrapper = styled.section<{
	$standalone?: boolean
}>`
  display: grid;
  gap: 1rem;
  margin: ${({ $standalone }) =>
		$standalone ? '0 0.9rem 1rem' : '1.5rem 0.9rem 1rem'};
  width: calc(100% - 1.8rem);
`
