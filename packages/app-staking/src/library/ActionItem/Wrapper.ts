// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.h3`
  border-bottom: 1px solid var(--gray-500);
  color: var(--gray-1000);
  font-family: var(--font-family-semibold);
  display: flex;
  align-items: center;
  margin: 1.25rem 0 0;
  padding-bottom: 0.75rem;
  width: 100%;

  > svg {
    margin-right: 0.65rem;
  }

  .toggle {
    background: var(--bg-input);
    border: 1px solid var(--gray-500);
    border-radius: 0.4rem;
    margin-right: 0.65rem;
    width: 1.75rem;
    height: 1.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  span {
    margin-left: 0.5rem;
  }
`
