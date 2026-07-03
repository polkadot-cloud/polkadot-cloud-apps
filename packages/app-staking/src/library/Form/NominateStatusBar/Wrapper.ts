// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-end;
  margin-top: 1rem;

  .bars {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: flex-end;
    margin-top: 1rem;

    > section {
      padding: 0 0.15rem;

      &:nth-child(1) {
        flex-basis: 15%;
      }
      &:nth-child(2) {
        flex-basis: 40%;
      }
      &:nth-child(3) {
        flex-basis: 45%;
      }
      h4,
      h5 {
        color: var(--gray-900);
      }

      h4 {
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        margin: 1.25rem 0 0.4rem 0;
      }
      h5 {
        position: relative;
        opacity: 0.75;
      }
      .bar {
        background: var(--gray-500);
        width: 100%;
        padding: 0.65rem 0.75rem;
        overflow: hidden;
        position: relative;
        transition: background var(--transition-duration);
      }
      &:first-child .bar {
        border-top-left-radius: 1.5rem;
        border-bottom-left-radius: 1.5rem;
        h5 {
          margin-left: 0.25rem;
        }
      }
      &:last-child .bar {
        border-top-right-radius: 1.5rem;
        border-bottom-right-radius: 1.5rem;
      }

      &.invert {
        h4 {
          color: var(--gray-1000);
        }
        h5 {
          opacity: 1;
          color: var(--gray-100);
        }
        .bar {
          background: var(--gray-1000);
        }
      }
    }
  }
`
