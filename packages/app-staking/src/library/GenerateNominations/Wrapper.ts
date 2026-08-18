// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;

  > div:last-child {
    width: 100%;
  }
`

export const NominationHealthWrapper = styled.section`
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0.9rem 1rem;
  width: calc(100% - 1.8rem);
`
