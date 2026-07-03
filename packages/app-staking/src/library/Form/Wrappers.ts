// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SmallFontSizeMaxWidth } from 'consts'
import styled from 'styled-components'

export const Spacer = styled.div`
  width: 100%;
  height: 1px;
  margin: 0.75rem 0;
`

export const RowWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-end;

  > div:last-child {
    height: 100%;
    flex-grow: 1;
    display: flex;
    flex-flow: row wrap;
    align-items: flex-end;
    padding: 0.5rem 1rem;
  }
`

export const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;

  h3 {
    color: var(--gray-900);
    margin: 0;
    padding: 0 0.25rem;
  }

  > .inner {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    margin-top: 0.75rem;
    padding: 0;

    > section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .input {
        border: 1px solid var(--gray-500);
        padding: 1rem;
        border-radius: 0.75rem;
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        flex: 1;

        > div {
          &:first-child {
            flex-grow: 1;
          }

          &:last-child {
            color: var(--gray-900);
            padding-left: 0.5rem;
            justify-content: flex-end;
            opacity: 0.5;
            position: relative;
            max-width: 50%;

            @media (max-width: ${SmallFontSizeMaxWidth}px) {
              display: none;
            }

            p {
              font-family: var(--font-family-semibold);
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
              position: relative;
              margin: 0;
              font-size: 1rem;
            }
          }
          > input {
            font-family: var(--font-family-bold);
            border: none;
            padding: 0;
            width: 100%;
            max-width: 100%;
            flex-grow: 1;
          }
        }
      }
    }
  }

  .availableOuter {
    @media (min-width: ${SmallFontSizeMaxWidth + 1}px) {
      display: none;
    }
    color: var(--gray-900);
    opacity: 0.5;
    padding: 0 0.5rem;
    margin-top: 0;
  }
`
