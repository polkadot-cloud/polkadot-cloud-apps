// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
`

export const ListStatusWrapper = styled.div`
  width: 100%;
  padding: 1rem 0.5rem;
`

export const ListEndBadge = styled.div`
  width: 100%;
  padding: 1rem 0.5rem 0.35rem;
  display: flex;
  justify-content: center;

  > span {
    color: var(--gray-800);
    font-family: var(--font-family-semibold);
    font-size: 1.2rem;
    padding: 0.5rem 0.85rem;
  }
`

export const ItemWrapper = styled.div`
  padding: 0.5rem;
  width: 100%;

  > .inner {
    background: var(--bg-list);
    border: 1px solid var(--gray-800);
    padding: 0 0.75rem;
    flex: 1;
    border-radius: 1rem;
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    flex: 1;
    max-width: 100%;

    &.share {
      background: var(--gray-200);
      border-color: var(--gray-500);
    }

    > .row {
      width: 100%;
      display: flex;
      flex-flow: row wrap;
      align-items: center;

      &:first-child {
        padding: 1rem 0 0.75rem 0;
      }

      &:last-child {
        border-top: 1px solid var(--gray-500);
        padding-top: 0rem;

        > div {
          min-height: 3.2rem;
        }
      }

      > div {
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        flex: 1;
        max-width: 100%;

        h4 {
          color: var(--gray-900);
          font-family: var(--font-family-semibold);
          &.claim {
            color: var(--gray-1000);
          }
          &.reward {
            color: var(--gray-1000);
          }
          &.share {
            color: var(--gray-800);
          }
        }

        h5 {
          color: var(--gray-900);
          &.claim {
            color: var(--gray-1000);
            border: 1px solid var(--gray-1000);
            border-radius: 0.75rem;
            padding: 0.2rem 0.5rem;
          }
          &.reward {
            color: var(--gray-1000);
            border: 1px solid var(--gray-1000);
            border-radius: 0.75rem;
            padding: 0.2rem 0.5rem;
          }
          &.share {
            color: var(--gray-800);
            border: 1px solid var(--gray-800);
            border-radius: 0.75rem;
            padding: 0.2rem 0.5rem;
          }
        }

        > div:first-child {
          flex-grow: 1;
          display: flex;
          flex-flow: row wrap;
          align-items: center;
        }

        > div:last-child {
          display: flex;
          flex-flow: row wrap;
          justify-content: flex-end;

          > h4 {
            color: var(--gray-900);
            opacity: 0.8;
          }
        }
      }
    }
  }
`
