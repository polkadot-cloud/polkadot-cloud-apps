// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SectionFullWidthThreshold } from 'consts'
import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  padding: 1rem;

  h2 {
    color: var(--gray-1000);
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
`

export const ContentWrapper = styled.div`
  width: 100%;

  > h4 {
    border-bottom: 1px solid var(--gray-500);
    color: var(--gray-900);
    margin: 0.75rem 0;
    padding-bottom: 0.5rem;
    width: 100%;
  }

  .items {
    position: relative;
    border-bottom: none;
    width: auto;
    border-radius: 0.75rem;
    overflow: hidden;
    overflow-y: auto;
    z-index: 1;
    width: 100%;
    margin: 1rem 0 1.5rem 0;

    h4 {
      margin: 0.2rem 0;
    }
    h2 {
      margin: 0.75rem 0;
    }
  }
`

export const NetworkButton = styled.button<{ $connected: boolean }>`
  background: var(--gray-400);
  border: 1px solid var(--status-success-transparent);
  padding: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  border-radius: 0.75rem;
  display: inline-flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
  ${(props) =>
		!props.$connected &&
		`
    border: 1px solid rgba(0,0,0,0);
  `}

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-family: var(--font-family-semibold);
    margin: 0 0.5rem;
  }

  h4 {
    &.selected {
      color: var(--status-success);
      margin-left: 0.75rem;
    }
  }

  > *:last-child {
    flex: 1;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-end;
  }
  &:hover {
    background: var(--gray-500);
  }
  .icon {
    margin-right: 0.5rem;
  }

  svg {
    color: var(--gray-900);
    fill: var(--gray-900);
  }
  p {
    color: var(--gray-1000);
    font-size: 1rem;
  }

  &:disabled {
    cursor: default;
    &:hover {
      background: var(--gray-400);
    }
  }
`

export const ConnectionsWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  margin-top: 1rem;
  margin-bottom: 1.5rem;

  > div {
    flex-basis: 50%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    &:first-child {
      padding-right: 1rem;
    }

    .provider {
      padding: 0 0.25rem;
      display: flex;
      align-items: center;

      @media (max-width: ${SectionFullWidthThreshold - 400}px) {
        position: relative;
        top: -0.5rem;
        margin-bottom: 1rem;
      }
    }

    @media (max-width: ${SectionFullWidthThreshold - 400}px) {
      flex-basis: 100%;
      &:first-child {
        padding-right: 0;
      }
    }
  }
`

export const ConnectionButton = styled.button<{ $connected: boolean }>`
  background: var(--gray-400);
  border: 1px solid var(--status-success-transparent);
  position: relative;
  padding: 1rem 0.75rem;
  margin-bottom: 1rem;
  margin-right: 0.5rem;
  border-radius: 0.75rem;
  ${(props) =>
		!props.$connected &&
		`
    border: 1px solid rgba(0,0,0,0);
  `}
  display: inline-flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;

  &:hover {
    background: var(--gray-500);
  }

  > h3 {
    font-family: var(--font-family-semibold);
    margin: 0 0.75rem;
  }
  h4 {
    &.selected {
      color: var(--status-success);
      margin: 0 0.75rem 0 0;
    }
  }

  &:disabled {
    cursor: default;
    &:hover {
      background: var(--gray-400);
    }
    &.off {
      h3 {
        opacity: var(--opacity-disabled);
      }
    }
  }
`
