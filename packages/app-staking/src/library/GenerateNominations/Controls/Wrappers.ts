// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

const BaseMenuWrapper = styled.div`
  --menu-background: var(--nomination-menu-color);
  --menu-surface: var(--nomination-menu-surface);
  --menu-popover-background: color-mix(in srgb, var(--menu-surface) 75%, var(--nomination-popover-highlight));
  --menu-border: color-mix(in srgb, var(--menu-popover-background) 91%, var(--gray-1000));
  --menu-foreground: var(--gray-800);
  --menu-separator: var(--menu-border);
  --menu-hover-background: color-mix(in srgb, var(--menu-background) 75%, var(--gray-500));

  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  border-top: 1px solid var(--menu-border);
  /* Continue the bottom line through empty space; buttons cover it with their own edges. */
  box-shadow: inset 0 -1px 0 var(--menu-border);

  > .menuControlsInner {
    width: 100%;
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    min-height: 3.8rem;
    position: relative;

    > button,
    > .methodPrompt,
    > .actions > button {
      border-bottom: 1px solid var(--menu-border);
      background: var(--menu-surface);
    }

    > button[data-state='open'],
    > .actions > button[data-state='open'] {
      border-bottom-color: transparent;
    }

    > button,
    > .methodPrompt {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      min-height: 3.8rem;
      max-width: 100%;
      height: auto;
      padding: 0 1.25rem;
      border-inline-start: 1px solid var(--menu-separator);
      border-inline-end: 0;
      border-radius: 0;
      color: var(--menu-foreground);
      opacity: 1;
    }

    > button > div {
      height: auto;
      padding: 0;
      background: transparent;
      color: inherit;
      opacity: 1;
    }

    /* The trigger owns its left separator so the attached popover shares that edge. */
    > button:first-child,
    > .methodPrompt:first-child {
      border-inline-start: 0;
    }

    > button:is(:hover, :focus-visible, :active, [data-state='open']):not(:disabled) {
      background: var(--menu-hover-background);
      color: var(--gray-900);
    }

    > button[data-state='open']:not(:disabled) {
      background: var(--menu-popover-background);
      color: var(--gray-1000);
    }

    > button:disabled {
      color: color-mix(in srgb, var(--menu-foreground) 35%, transparent);
      cursor: default;
    }

    > button:has(.removeSelected):not(:disabled) {
      color: var(--status-danger);
    }

    > button:focus-visible {
      outline: 2px solid var(--accent-700);
      outline-offset: -2px;
    }

    > button svg[data-icon='caret-down'] {
      transform: scale(0.9);
      transition: transform var(--transition-duration);
    }

    > button[data-state='open'] svg[data-icon='caret-down'] {
      transform: rotate(180deg) scale(0.9);
    }

    > .methodPrompt {
      opacity: var(--opacity-disabled);
      cursor: default;
    }

    > .actions {
      align-items: center;
      display: flex;
      gap: 1rem;
      margin-left: auto;
      flex-shrink: 0;
      padding-left: 1rem;

      > button {
        display: flex;
        align-items: center;
        min-height: 3.8rem;
        padding-block: 0.4rem;
      }

      .revert {
        border-radius: var(--btn-sm-radius);
      }

      @media (max-width: 600px) {
        border-top: 1px solid var(--menu-separator);
        justify-content: flex-end;
        width: 100%;
      }
    }

    @media (max-width: 600px) {
      > button,
      > .methodPrompt {
        padding-inline: 1rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      > button,
      > button svg[data-icon='caret-down'] {
        transition: none;
      }
    }
  }
`

export const MenuWrapper = styled(BaseMenuWrapper)`
  background: var(--nomination-menu-surface);

  @media (max-width: 1200px) {
    padding: 0 1.5rem;
  }

  > .menuControlsInner {
    max-width: 1200px;
    margin: 0 auto;

    > .actions .revert {
      background: var(--gray-500);
      border-color: var(--gray-500);
    }
  }
`

export const StandaloneMenuWrapper = styled(BaseMenuWrapper)`
  --menu-background: var(--nomination-standalone-menu-color);
  --menu-surface: var(--nomination-standalone-menu-surface);

  margin-top: 1rem;

  &::before {
    background: var(--nomination-standalone-menu-surface);
    border-top: 1px solid var(--menu-border);
    box-shadow: inset 0 -1px 0 var(--menu-border);
    content: '';
    inset: -1px auto 0 50%;
    position: absolute;
    transform: translateX(-50%);
    width: 100vw;

    @media (min-width: 826px) {
      left: calc(50% + 1.25rem);
    }
  }

  > .menuControlsInner {
    > .actions {
      padding-right: 0.75rem;
    }

    > .actions .revert {
      background: var(--gray-500);
      border-color: var(--gray-500);
    }
  }
`

export const EmbeddedMenuWrapper = styled(BaseMenuWrapper)`
  background: var(--nomination-menu-surface);
  border-radius: var(--btn-sm-radius);
  margin-bottom: 1rem;
  overflow: hidden;

  > .menuControlsInner > .actions {
    padding-right: 0.75rem;
  }
`
