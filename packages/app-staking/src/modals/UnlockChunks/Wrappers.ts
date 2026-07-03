// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  border-radius: 1rem;
  width: 100%;

  > div:last-child {
    margin-bottom: 0;
  }

  .has-unlocked {
    color: var(--status-success);
  }

  .withdraw-action {
    margin: 1rem 0 0.5rem 0;
    width: 100%;

    > button {
      width: 100%;
    }
  }
`

export const ChunkWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column wrap;
  margin-top: 1.25rem;

  > div {
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 1rem;

    > .chunk-header {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    > .status-line {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--gray-900);
      font-size: 0.85rem;
      margin-top: 0.35rem;

      &.ready {
        color: var(--status-success);
        font-family: var(--font-family-semibold);
      }
    }

    > .chunk-bar-labels {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.4rem;

      > span {
        font-size: 0.85rem;
        color: var(--gray-900);
      }
    }
  }

  h2 {
    margin: 0;
  }
`
