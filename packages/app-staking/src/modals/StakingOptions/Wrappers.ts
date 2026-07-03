// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const ItemsWrapper = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 1rem;
  flex-direction: column;
`

export const ItemWrapper = styled.button`
  flex: 1;
  margin: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 1rem;
  background: var(--gray-400);
  border-radius: 0.75rem;
  transition: background 0.1s ease-in-out;

  &:hover {
    background: var(--gray-500);
  }

  > svg {
    margin: 0 0 1rem 0;
  }

  > h2 {
    margin: 0.5rem 0;
  }

  > h3 {
    color: var(--text-tertiary);
  }
`
