// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SectionFullWidthThreshold } from 'consts'
import styled from 'styled-components'

export const RolesWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  margin-top: 0.25rem;

  > section {
    flex: 1 1 25%;
    padding: 0 0.5rem;
    border-right: 1px solid var(--gray-500);

    @media (max-width: ${SectionFullWidthThreshold}px) {
      border-bottom: 1px solid var(--gray-500);
      flex-basis: 100%;
      border-right: none;
      margin: 0.75rem 0;

      &:first-child {
        margin-top: 0;
      }
      &:last-child {
        margin-bottom: 0;
        border-bottom: 0;
      }
    }

    &:last-child {
      border-right: none;
    }

    .inner {
      flex: 1;
      padding: 0 0.5rem;

      @media (max-width: ${SectionFullWidthThreshold}px) {
        padding: 0;
      }

      > h4 {
        font-family: var(--font-family-semibold);
        display: flex;
        align-items: center;
        margin-top: 1.25rem;
      }
    }
  }
`
