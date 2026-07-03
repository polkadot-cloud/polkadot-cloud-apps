// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const AccountWrapper = styled.div`
  transition: transform var(--transition-duration);
  margin: 0.6rem 0 0 0;
  width: 100%;

  &.active {
    > div {
      border: 1px solid var(--gray-1000);
    }
  }

  &:hover {
    transform: scale(1.01);
  }

  > div {
    background: var(--gray-400);
    color: var(--gray-1000);
    font-family: var(--font-family-semibold);
    border: 1px solid transparent;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    border-radius: 0.85rem;
    width: 100%;
    overflow: hidden;

    &.noBorder {
      border: none;
    }

    > section {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;

      /* Top half of the button, account information */
      &.head {
        > button {
          color: var(--gray-1000);
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 1;
          padding: 0.5rem 0.75rem;
          font-size: 1.05rem;
          width: 100%;
          transition: background var(--transition-duration);

          &:hover {
            .name {
              color: var(--gray-1000);
            }
          }

          .label {
            font-size: 0.95rem;
            display: flex;
            align-items: flex-end;
          }

          overflow: hidden;
          .name {
            transition: color var(--transition-duration);
            font-family: var(--font-family-semibold);
            max-width: 100%;
            margin: 0 0.5rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            > span {
              opacity: 0.7;
              margin-right: 0.6rem;
              > svg {
                margin-left: 0.5rem;
              }
            }
          }

          .badge {
            background-color: var(--bg-card-floating);
            color: var(--gray-900);
            margin-left: 1rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0.45rem;
            font-size: 0.9rem;
          }
          .delegator {
            width: 1.1rem;
            z-index: 0;

            > div {
              width: 2rem;
              height: 2rem;
              top: 0.25rem;
            }
          }
          .identicon {
            z-index: 1;
          }

          /* svg theming */
          svg {
            .light {
              fill: var(--gray-100);
            }
            .dark {
              fill: var(--gray-900);
            }
          }

          > div:last-child {
            display: flex;
            flex-grow: 1;
            justify-content: flex-end;

            &.neutral {
              h5 {
                color: var(--gray-900);
                opacity: 0.75;
              }
            }
            &.danger {
              h5 {
                color: var(--status-danger);
              }
            }
            .icon {
              width: 1.25rem;
              height: 1.25rem;
              margin-left: 0.75rem;

              svg {
                width: inherit;
                height: inherit;
              }
            }
          }
        }
      }

      /* Bottom half of the button, account metadata */
      &.foot {
        border-top: 1px solid var(--gray-500);
        padding: 0.7rem 1rem;

        > .balance {
          color: var(--gray-900);
          font-size: 0.9rem;
          opacity: 0.6;
        }
      }
    }
  }
`

export const AccountSeparator = styled.div`
  width: 100%;
  height: 0.5rem;
`
