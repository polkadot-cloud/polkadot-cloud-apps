// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const ModeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;

  button {
    background-color: var(--gray-300);
    color: var(--gray-700);

    &.active {
      background-color: var(--accent-200);
      color: var(--accent-900);
    }
  }
`

export const QrContainer = styled.div`
  background-color: white;
  border: 1px solid var(--gray-500);
  width: 210px;
  height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  position: relative;
`

export const SpinnerOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
`

export const QrImage = styled.img`
  width: 180px;
  height: 180px;
  image-rendering: pixelated;
`

export const ExplainerBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background-color: var(--shade-300);
  border: 1px solid var(--gray-500);
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  margin-top: 0.75rem;
  width: 100%;

  .text {
    font-size: 1.1rem;
    flex: 1;

    h3 {
      font-family: 'DM Serif Display', serif;
      font-size: 1.4rem;
      margin: 0 0 0.6rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge {
      background-color: var(--accent-200);
      color: var(--accent-900);
      font-family: Inter, sans-serif;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.2rem 0.75rem;
      border-radius: 0.75rem;
      margin-left: 0.4rem;
    }

    p {
      font-size: 1.1rem;
      line-height: 1.45;
      margin: 0;
    }

    a {
      color: var(--accent-700);
      display: inline-block;
      margin-top: 0.75rem;
    }
  }

  .icon {
    color: var(--gray-500);
    font-size: 2.5rem;
    flex-shrink: 0;
  }
`
