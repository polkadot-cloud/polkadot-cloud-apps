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
  background: var(--gray-200);
  border: 1px solid var(--gray-400);
  border-radius: 1.25rem;
  display: grid;
  gap: 0.75rem;
  margin: 0 0.9rem 1rem;
  padding: 1rem;
  width: calc(100% - 1.8rem);
`
