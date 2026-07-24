// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const GraphWrapper = styled.div`
  position: relative;
  flex: 0;
  padding: 1rem 2rem 1rem 0;
  width: 100%;
`

export const ValidatorGeoWrapper = styled.div`
  position: relative;
  padding: 1rem 2rem;
  width: 50%;
  flex-grow: 1;

  @media (max-width: 600px) {
    min-width: 100%;
    min-height: 125px;
  }
`
