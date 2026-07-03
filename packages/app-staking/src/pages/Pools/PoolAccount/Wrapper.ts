// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  padding-bottom: 0.5rem;
  margin-top: 1rem;

  .account {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 0;

    button {
      color: var(--gray-1000);
    }

    .icon {
      font-size: 1.7rem;
      max-width: 1.7rem;
      margin-right: 0.5rem;
    }
    h4 {
      padding: 0;
      > .addr {
        opacity: 0.75;
      }
    }

    > :last-child {
      display: flex;
      flex-flow: row-reverse wrap;
      margin-left: 0.5rem;

      > .copy {
        margin-left: 0.25rem;
      }
    }
  }
`
