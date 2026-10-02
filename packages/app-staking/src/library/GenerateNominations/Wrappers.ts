// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled, { keyframes } from 'styled-components'
import { CardWrapper } from 'ui-app/Card'
import { ButtonMonoInvert } from 'ui-buttons'
import { Loader } from 'ui-core/base'
import type { StandaloneStyleProps } from './types'

export const NominationHeading = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  min-height: 3.2rem;
  min-width: 0;
  /* Reserve space for the canvas settings and close controls. */
  padding-inline-end: 6.5rem;

  > div:first-child {
    flex: 0 1 auto;
    min-width: 0;
  }
`

const selectionActionEnter = keyframes`
  from {
    opacity: 0;
  }
`

export const SelectionActionTarget = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: 0.75rem;

  > button {
    align-items: center;
    animation: ${selectionActionEnter} 180ms ease-out;
    background: var(--gray-300);
    border: 0;
    border-radius: var(--btn-lg-radius);
    color: var(--gray-900);
    cursor: pointer;
    display: flex;
    font-family: var(--font-family-semibold);
    font-size: var(--btn-md-font-size);
    justify-content: center;
    padding: 0.65rem 1.25rem;
    transition: background-color var(--transition-duration) ease-in-out;
    white-space: nowrap;

    &:is(:hover, :focus-visible):not(:disabled) {
      background: var(--gray-400);
    }

    &:disabled {
      cursor: default;
      opacity: var(--opacity-disabled);
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  &:empty {
    display: none;
  }
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
    --shimmer-fg: color-mix(in srgb, var(--gray-400), var(--gray-500));
    --shimmer-bg: color-mix(in srgb, var(--gray-500), var(--gray-600));
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
		$standalone ? '0 0.9rem 1rem' : '0.5rem 0.9rem 1rem'};
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

    > svg {
      flex-shrink: 0;
      font-size: 0.95em;
      margin: 0 0.65rem 0 0;
    }
  }
`
