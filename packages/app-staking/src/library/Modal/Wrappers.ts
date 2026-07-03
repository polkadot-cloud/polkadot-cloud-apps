// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const StatsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  margin-top: 1rem;
`
export const StatWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  margin-bottom: 1rem;
  padding: 0 0.75rem;
  flex-grow: 1;
  flex-basis: 100%;

  @media (min-width: 600px) {
    margin-bottom: 0.5rem;
  }

  @media (min-width: 601px) {
    flex-basis: 33%;
  }

  > .inner {
    border-bottom: 1px solid var(--gray-500);
    padding-bottom: 0.5rem;

    > h2,
    h3,
    h4 {
      margin: 0.25rem 0;
    }
    h4 {
      margin: 0rem 0 0.75rem 0;
      display: flex;
      align-items: center;

      .icon {
        margin-right: 0.425rem;
      }
    }
    h2,
    h3,
    h4 {
      color: var(--gray-900);
    }
  }
`
