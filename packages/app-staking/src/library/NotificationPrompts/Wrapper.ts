// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.ul`
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  list-style: none;
  justify-content: flex-end;
  z-index: 12;

  li {
    background: var(--bg-primary);
    margin: 0.3rem 1.2rem;
    position: relative;
    border-radius: 1.25rem;
    padding: 1rem 1.35rem;
    display: flex;
    flex-flow: column wrap;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    width: 375px;

    h3 {
      color: var(--gray-1000);
      font-family: var(--font-family-semibold);
      font-size: 1.2rem;
      margin: 0.15rem 0 0.4rem;
      flex: 1;
    }
    p {
      font-size: 1.05rem;
      line-height: 1.45rem;
      margin: 0;
    }
  }
`
