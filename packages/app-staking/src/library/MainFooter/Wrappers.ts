// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  --network-bar-font-size: 0.98rem;

  color: var(--gray-900);
  font-size: var(--network-bar-font-size);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
  z-index: 6;
  backdrop-filter: blur(4px);
  padding-top: 0.75rem;
  padding-bottom: 2rem;
  width: 100%;
  margin: 0 auto;

  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 0 0 auto;
  }

  .icon {
    width: 2.15rem;
    height: 2.15rem;
    margin-right: 0.2rem;
  }

  .cloud-label {
    font-family: 'DM Serif Display', serif;
    color: var(--gray-1000);
    letter-spacing: 0.01em;
    font-size: 1.5rem;
  }
`

export const Summary = styled.div`
  width: 100%;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  align-content: center;

  /* hide connection status text on small screens */
  .hide-small {
    display: flex;
    align-items: center;
    align-content: center;

    @media (max-width: 600px) {
      display: none;
    }
  }

  a,
  button {
    color: var(--gray-900);
    font-size: var(--network-bar-font-size);
    opacity: 0.75;
  }
  p {
    font-size: var(--network-bar-font-size);
    border-left: 1px solid var(--gray-900);
    margin: 0.25rem 0.5rem 0.25rem 0.15rem;
    padding-left: 0.5rem;
    line-height: 1.3rem;

    &:first-child {
      border-left: none;
    }
  }
  .stat {
    margin: 0 0.25rem;
    display: flex;
    align-items: center;
    font-family: var(--font-family-mono);

    &.last {
      margin-left: 1rem;
    }
  }

  /* left and right sections for each row*/
  > section {
    color: var(--gray-900);
    padding: 0.5rem 0;

    /* left section */
    &:nth-child(1) {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      flex-grow: 1;
    }

    /* right section */
    &:last-child {
      flex-grow: 1;
      display: flex;
      align-items: center;
      flex-flow: row-reverse wrap;

      button {
        font-size: var(--network-bar-font-size);
        color: var(--gray-900);
        border-radius: 0.4rem;
        padding: 0.25rem 0.5rem;
      }
      span {
        &.pos {
          color: #3eb955;
        }
        &.neg {
          color: #d2545d;
        }
      }
    }
  }
`

export const Separator = styled.div`
  border-left: 1px solid var(--gray-900);
  opacity: 0.2;
  margin: 0 0.3rem;
  width: 1px;
  height: 1rem;
`
