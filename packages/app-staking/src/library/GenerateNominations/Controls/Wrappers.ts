// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SelectableWrapper } from 'library/List'
import styled from 'styled-components'

export const MenuWrapper = styled.div<{ $compact?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  background: ${({ $compact }) =>
		$compact ? 'transparent' : 'rgb(from var(--gray-300) r g b / 75%)'};
  margin-top: ${({ $compact }) => ($compact ? '1rem' : '0')};

  &::before {
    background: var(--gray-400);
    content: '';
    display: ${({ $compact }) => ($compact ? 'block' : 'none')};
    inset: 0 auto 0 50%;
    position: absolute;
    transform: translateX(-50%);
    width: 100vw;

    @media (min-width: 826px) {
      left: calc(50% + 1.25rem);
    }
  }

  @media (max-width: 1200px) {
    padding: ${({ $compact }) => ($compact ? '0' : '0 1.5rem')};
  }

  > .menuControlsInner {
    width: 100%;
    max-width: ${({ $compact }) => ($compact ? 'none' : '1200px')};
    margin: ${({ $compact }) => ($compact ? '0' : '0 auto')};
    display: flex;
    padding: ${({ $compact }) => ($compact ? '0.4rem 0.75rem' : '0.4rem 0')};
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
        background: ${({ $compact }) =>
					$compact ? 'var(--gray-500)' : 'var(--gray-400)'};
        border-color: ${({ $compact }) =>
					$compact ? 'var(--gray-500)' : 'var(--gray-400)'};
        border-radius: var(--btn-sm-radius);
      }
    }
  }
`

export const InlineControlsWrapper = styled(SelectableWrapper)<{
	$standalone?: boolean
}>`
  margin-top: ${({ $standalone }) => ($standalone ? '1.25rem' : '0.25rem')};
  margin-bottom: ${({ $standalone }) => ($standalone ? '0' : '0.75rem')};
`
