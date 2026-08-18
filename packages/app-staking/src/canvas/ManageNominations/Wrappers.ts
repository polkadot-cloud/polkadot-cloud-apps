// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const NominationSummary = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.35rem 1.5rem 0.5rem;

  > h3 {
    color: var(--gray-1000);
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.2;
    margin: 0 0 0.45rem;
  }

  > .row {
    align-items: center;
    border-bottom: 1px solid var(--gray-400);
    color: var(--gray-1000);
    display: flex;
    font-size: 1.15rem;
    justify-content: space-between;
    line-height: 1.4;
    padding: 0.95rem 0;

    > span:last-child {
      white-space: nowrap;
    }
  }

  > .total {
    font-size: 1.2rem;
    font-weight: 700;
  }
`

export const SubmitTxContainer = styled.div`
  padding-bottom: 1rem;
`
