// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  > section {
    color: var(--gray-900);
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }

  > section:last-child {
    flex: 1;
    justify-content: flex-end;

    .progress {
      color: var(--gray-900);
      opacity: 0.5;
    }

    .complete {
      margin: 0;
      color: var(--gray-1000);
    }

    span {
      margin-right: 1rem;
    }
  }

  h2 {
    padding: 0.3rem 0;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }
`
