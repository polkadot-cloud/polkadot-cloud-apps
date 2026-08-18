// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const SettingsControl = styled.div`
  position: absolute;
  right: 4.5rem;
  top: 1rem;
  z-index: 10;

  > button {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 50%;
    color: var(--gray-900);
    display: flex;
    height: 3.125rem;
    justify-content: center;
    opacity: 0.7;
    padding: 0;
    transition:
      background-color var(--transition-duration) ease-in-out,
      opacity var(--transition-duration) ease-in-out,
      transform var(--transition-duration) ease-in-out;
    width: 3.125rem;

    &:hover {
      background: var(--gray-300);
      opacity: 1;
    }

    &:active {
      transform: scale(0.94);
    }

    &:focus-visible {
      outline: 2px solid var(--gray-700);
      outline-offset: 2px;
    }
  }
`

export const SettingsTrigger = styled.span`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;

  > svg {
    height: 1.25rem;
    width: 1.25rem;
  }

  > span {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
`

export const SettingsWarning = styled.p`
  && {
    color: var(--gray-900);
  }

  font-family: var(--font-family-regular);
  font-size: 1rem;
  line-height: 1.4;
  margin: 0;
  padding: 1rem;
`
