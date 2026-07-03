// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;

  &.app {
    height: 100vh;
  }
  &.modal {
    padding: 0.75rem 0 0 0;
  }

  h1,
  h2 {
    color: var(--gray-900);
  }

  h2 {
    margin: 1rem 0;
  }

  h3 {
    margin: 1rem 0;
    &.with-margin {
      margin-top: 10rem;
    }
    margin-bottom: 3rem;
    svg {
      color: var(--gray-900);
    }
  }

  button {
    color: var(--gray-900);
    font-size: 1.25rem;

    &:hover {
      opacity: 0.75;
    }
  }
`
