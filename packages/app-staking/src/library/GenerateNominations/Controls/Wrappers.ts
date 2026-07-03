// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const MenuWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  background: rgb(from var(--gray-300) r g b / 75%);

  @media (max-width: 1200px) {
      padding: 0 1.5rem;
    }

  > .inner {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    padding: 0.05rem 0;
    align-items: center;

    > button {
      margin-right: 2.25rem;
    }
  }
`
