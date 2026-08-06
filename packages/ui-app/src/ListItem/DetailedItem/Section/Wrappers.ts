// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const SectionHeader = styled.header`
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
  min-width: 0;
  width: 100%;

  > strong {
    color: var(--gray-900);
    font-family: var(--font-family-bold);
    font-size: 1.15rem;
  }
`
