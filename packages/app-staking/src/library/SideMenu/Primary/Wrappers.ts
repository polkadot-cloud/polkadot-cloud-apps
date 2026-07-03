// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.span`
  border: none;
  height: 3.2rem;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  margin: 0.25rem 0.2rem 0.25rem 0;
  padding: 0rem 0.5rem 0rem 0.95rem;
  position: relative;
  transition: background 0.15s ease;
  cursor: pointer;
  
  .iconContainer {
    width: 2.5rem;
  }
  
  .icon {
    color: var(--gray-900);
    margin-left: 0.25rem;
    margin-right: 0.65rem;
    transition: transform 0.2s ease;
  }

  &.minimised {
    border-radius: 0.5rem;
    font-size: 1.1rem;
    justify-content: center;
    margin: 1rem 0rem;
    padding: 0rem;
    height: 3.4rem;
    width: calc(100% - 0.5rem);

    .iconContainer {
      width: auto;
    }

    &.success,
    &.accent {
      border: 1.5px solid var(--gray-700);
    }
    &.warning {
      border: 1px solid var(--status-warning);
    }

    .icon {
      margin-left: 0;
      margin-right: 0;
    }
  }

  &:hover {
    .icon {
      transform: scale(1.05);
    }
  }

  &:active {
    .icon {
      transform: scale(0.92);
    }
  }
  
  .name {
    font-family: var(--font-family-semibold);
    margin: 0;
    padding: 0;
    line-height: 1.35rem;
  }

  &.active {
    background: var(--highlight-alt);
  }

  /* Advanced mode styles */
  &.advanced {
    margin: 0 0 0.35rem 0;

    &.active {
      background: var(--highlight-alt);
    }
  }

  &.inactive:hover {
    background: var(--highlight-alt);
  }

  &.minimised {
     &.active {
      background: var(--highlight);
    }
    &.inactive:hover {
      background: var(--highlight);
    }
  }
`
