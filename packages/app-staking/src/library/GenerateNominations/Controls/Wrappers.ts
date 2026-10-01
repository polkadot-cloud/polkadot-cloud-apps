// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

const BaseMenuWrapper = styled.div`
  --menu-background: var(--gray-400);

  width: 100%;
  display: flex;
  align-items: center;
  position: relative;

  .light & {
    --menu-background: color-mix(in srgb, var(--gray-200), var(--gray-300));
  }

  > .menuControlsInner {
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 2rem;
    position: relative;

    > button {
      flex-shrink: 0;
    }

    > button:focus-visible {
      border-radius: var(--btn-sm-radius);
      outline: 2px solid var(--accent-700);
      outline-offset: 2px;
    }

    .generateButton > svg[data-icon='caret-down'] {
      transform: scale(0.9);
    }

    .generateDisabled {
      background: transparent;
      opacity: var(--opacity-disabled);
    }

    > .actions {
      align-items: center;
      display: flex;
      gap: 1rem;
      margin-left: auto;
      flex-shrink: 0;

      > button {
        display: flex;
      }

      .revert {
        border-radius: var(--btn-sm-radius);
      }

      @media (max-width: 600px) {
        justify-content: flex-end;
        width: 100%;
      }
    }
  }
`

export const MenuWrapper = styled(BaseMenuWrapper)`
  background: rgb(from var(--menu-background) r g b / 75%);

  @media (max-width: 1200px) {
    padding: 0 1.5rem;
  }

  > .menuControlsInner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.4rem 0;

    > .actions .revert {
      background: var(--gray-500);
      border-color: var(--gray-500);
    }
  }
`

export const StandaloneMenuWrapper = styled(BaseMenuWrapper)`
  margin-top: 1rem;

  .light & {
    --menu-background: #efeff0;
  }

  &::before {
    background: var(--menu-background);
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

export const EmbeddedMenuWrapper = styled(BaseMenuWrapper)`
  background: rgb(from var(--menu-background) r g b / 75%);
  border-radius: var(--btn-sm-radius);
  margin-bottom: 1rem;
  padding: 0.4rem 0.75rem;
`
