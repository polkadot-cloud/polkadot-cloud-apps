// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const DelegatesWrapper = styled.div`
  border-left: 1px solid var(--gray-500);
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  margin: 0.65rem 0 1.25rem 0;

  > div {
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
`
