// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9;
  animation: fadeInScale 0.2s cubic-bezier(0, 1, 0, 1) forwards;

  > .qrRegion {
    background: var(--bg-body);
    border-radius: 0.85rem;
    overflow: hidden;
    width: 250px;
    height: 188px;
    margin: 0.5rem 0;
  }

  > h3 {
    display: flex;
    align-items: flex-end;
    margin: 0.5rem 0 1rem 0;

    > div {
      width: 2rem;
      aspect-ratio: 8;
      background: radial-gradient(
          circle closest-side,
          var(--gray-1000) 100%,
          #0000
        )
        0 / calc(100% / 3) 100% space;
      clip-path: inset(0 100% 0 0);
      animation: dots 4s steps(4) infinite;
      position: relative;
      top: -0.28rem;
      margin-left: 0.4rem;
    }
  }

  @keyframes dots {
    to {
      clip-path: inset(0 -34% 0 0);
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0.75;
      transform: scale(0.75);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`
