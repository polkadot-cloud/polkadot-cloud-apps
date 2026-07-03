// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  margin-top: 0.5rem;

  .input {
    border: 1px solid var(--gray-500);
    border-radius: 1rem;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 0.25rem 0.5rem 0.25rem 1rem;

    > section {
      display: flex;
      flex-flow: column wrap;

      > input {
        font-family: var(--font-family-semibold);
        width: 100%;
        border: none;
        padding-right: 1rem;
      }

      &:first-child {
        flex: 1;
      }
    }
  }
  h5 {
    margin: 0.75rem 0.25rem;
    &.neutral {
      color: var(--gray-900);
      opacity: 0.8;
    }
    &.danger {
      color: var(--status-danger);
    }
    &.success {
      color: var(--status-success);
    }
  }
`
