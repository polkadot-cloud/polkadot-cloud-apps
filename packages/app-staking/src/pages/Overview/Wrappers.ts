// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SectionFullWidthThreshold } from 'consts'
import styled from 'styled-components'

export const MoreWrapper = styled.div`
  padding: 0 0.5rem;
  padding-bottom: 1rem;
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  margin-top: 2.25rem;

  @media (max-width: ${SectionFullWidthThreshold}px) {
    margin-top: 1.5rem;
    padding: 0 0.75rem;
    margin-bottom: 0.5rem;
  }
  h4 {
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
  }
  section {
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 0.1rem;
    div {
      margin-left: 0.5rem;
    }
  }
`
