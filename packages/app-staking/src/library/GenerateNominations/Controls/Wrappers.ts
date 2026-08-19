// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SelectableWrapper } from 'library/List'
import styled from 'styled-components'
import type { InlineControlsWrapperProps } from './types'

const BaseMenuWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;

  > .menuControlsInner {
    width: 100%;
    display: flex;
    align-items: center;
    position: relative;

    > button {
      margin-right: 2.25rem;
    }

    .generateDisabled {
      background: transparent;
      opacity: var(--opacity-disabled);
    }

    > .actions {
      align-items: center;
      display: flex;
      gap: 0.75rem;
      margin-left: auto;
      flex-shrink: 0;

      > button {
        display: flex;
      }

      .revert {
        border-radius: var(--btn-sm-radius);
      }
    }
  }
`

export const MenuWrapper = styled(BaseMenuWrapper)`
  background: rgb(from var(--gray-300) r g b / 75%);

  @media (max-width: 1200px) {
    padding: 0 1.5rem;
  }

  > .menuControlsInner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.4rem 0;

    > .actions .revert {
      background: var(--gray-400);
      border-color: var(--gray-400);
    }
  }
`

export const StandaloneMenuWrapper = styled(BaseMenuWrapper)`
  margin-top: 1rem;

  &::before {
    background: var(--gray-400);
    content: '';
    inset: 0 auto 0 50%;
    position: absolute;
    transform: translateX(-50%);
    width: 100vw;

    @media (min-width: 826px) {
      left: calc(50% + 1.25rem);
    }
  }

  > .menuControlsInner {
    padding: 0.4rem 0.75rem;

    > .actions .revert {
      background: var(--gray-500);
      border-color: var(--gray-500);
    }
  }
`

export const InlineControlsWrapper = styled(
	SelectableWrapper,
)<InlineControlsWrapperProps>`
  margin-top: ${({ $standalone }) => ($standalone ? '1.25rem' : '0.25rem')};
  margin-bottom: ${({ $standalone }) => ($standalone ? '0' : '0.75rem')};
`
