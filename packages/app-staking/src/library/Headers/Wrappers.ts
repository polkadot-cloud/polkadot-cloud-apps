// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { PageWidthMediumThreshold } from 'consts'
import styled from 'styled-components'

export const MenuWrapper = styled.div`
  display: none;

  @media (max-width: ${PageWidthMediumThreshold}px) {
    color: var(--gray-900);
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }

  > button {
    padding-left: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 1.05rem;
    flex: 0;
    width: 50px;
    line-height: 2.2rem;
  }
`
