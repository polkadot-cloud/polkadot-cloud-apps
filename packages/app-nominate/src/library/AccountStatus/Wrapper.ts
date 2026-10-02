// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  align-items: center;
  color: var(--gray-700);
  display: flex;
  font-family: var(--font-family-semibold);
  font-size: 1.1rem;
  min-width: 0;

  > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > .compact {
    display: none;
  }

  @media (max-width: 826px) {
    font-size: 1rem;

    > .full {
      display: none;
    }

    > .compact {
      display: block;
    }
  }
`
