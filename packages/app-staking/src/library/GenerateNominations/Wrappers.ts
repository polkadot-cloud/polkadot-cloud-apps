// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'
import { CardWrapper } from 'ui-app/Card'
import { ButtonMonoInvert } from 'ui-buttons'
import { Loader } from 'ui-core/base'
import type { StandaloneStyleProps } from './types'

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

export const AccountPromptGraphic = styled.div`
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
`

export const NominationEditorWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;

  > div:last-child {
    width: 100%;
  }
`

export const StandaloneCards = styled(NominationEditorWrapper)`
  flex-flow: column nowrap;

  > ${CardWrapper} {
    flex: 0 0 auto;
    width: 100%;

    &.transparent {
      overflow: visible;
    }
  }
`

export const NominationsLoader = styled(Loader)<StandaloneStyleProps>`
  height: 5.5rem;
  margin: 0.9rem;
  width: calc(100% - 1.8rem);

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

export const StandalonePreloader = styled(NominationsLoader)`
  margin-top: 1.4rem;

  .light & {
    --shimmer-fg: var(--gray-500);
    --shimmer-bg: var(--gray-600);
  }

  .dark & {
    --shimmer-fg: var(--gray-200);
    --shimmer-bg: var(--gray-400);
  }
`

export const NominationHealthWrapper = styled.section<StandaloneStyleProps>`
  display: grid;
  gap: 1rem;
  margin: ${({ $standalone }) =>
		$standalone ? '0 0.9rem 1rem' : '1.5rem 0.9rem 1rem'};
  width: calc(100% - 1.8rem);
`

export const EmptyNominations = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.25rem 1.15rem 2rem;
  width: 100%;

  > h4 {
    border-bottom: 1px solid var(--gray-500);
    color: var(--text-tertiary);
    font-size: 1.2rem;
    font-weight: 500;
    line-height: 1.4;
    margin: 0;
    padding-bottom: 0.35rem;
  }
`

export const CloudStartButton = styled(ButtonMonoInvert)`
  && {
    background: var(--gray-200);
    border: 1px solid var(--gray-500);
    border-radius: var(--btn-sm-radius);
    box-shadow: 0 2px 6px rgb(0 0 0 / 6%);
    color: var(--gray-900);
    font-size: var(--btn-lg-font-size);
    line-height: 1.4;
    max-width: 100%;
    padding: 0.85rem 1.15rem;
    text-align: left;
    white-space: normal;

    &:hover:not(:disabled) {
      border-color: var(--gray-600);
      transform: none;
    }

    &:focus-visible {
      outline: 2px solid var(--gray-900);
      outline-offset: 4px;
    }

    > svg {
      flex-shrink: 0;
      font-size: 0.95em;
      margin: 0 0.65rem 0 0;
    }
  }
`
