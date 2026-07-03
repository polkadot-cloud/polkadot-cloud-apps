// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { PageWidthLargeThreshold, PageWidthMediumThreshold } from 'consts'
import styled from 'styled-components'
import type { CardWrapperProps } from './types'

/* CardWrapper
 *
 * Used to separate the main modules throughout the app.
 */
export const CardWrapper = styled.div<CardWrapperProps>`
  box-shadow: var(--shadow);
  background: var(--bg-primary);
  border-radius: 1.1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  overflow: hidden;
  margin-top: 1.4rem;
  padding: 1.5rem;
  transition: border 0.2s;

  &.canvas {
    background: var(--gray-300);
    padding: 1.25rem;

    &.secondary {
      padding: 1rem;
    }
  }

  &.transparent {
    background: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
    margin-top: 0;
    padding: 0;
  }

  &.warning {
    border: 1px solid var(--status-warning);
  }

  &.prompt {
    border: 1px solid var(--gray-700);
  }

  @media (max-width: ${PageWidthMediumThreshold}px) {
    padding: 1.25rem 1rem;
  }

  ${(props) =>
		props.height &&
		`
    @media (min-width: ${PageWidthMediumThreshold + 1}px) {
      max-height: ${props.height}px;
    }

    @media (min-width: ${PageWidthLargeThreshold + 1}px) {
      min-height: ${props.height}px;
    }
  `}

  .inner {
    padding: 1rem;
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    position: relative;
  }

  .content {
    padding: 0 0.5rem;

    h3,
    h4 {
      margin-top: 0;
    }
    h3 {
      margin-left: 0;
      margin-bottom: 0.75rem;
    }

    h4 {
      margin-bottom: 0;
    }
  }
`
