// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	PageWidthMediumThreshold,
	SideMenuHiddenWidth,
	SideMenuMaximisedWidth,
	SideMenuMinimisedWidth,
} from 'consts'
import styled from 'styled-components'
import type { MinimisedProps } from './types'

export const Wrapper = styled.div<MinimisedProps>`
  background: ${(props) => (props.$minimised ? 'var(--bg-min-side-menu)' : 'none')};
  overflow: auto;
  flex-grow: 1;
  display: flex;
  flex-flow: column nowrap;
  backdrop-filter: blur(4px);
  width: ${(props) =>
		props.$minimised
			? `${SideMenuMinimisedWidth}px`
			: `${SideMenuMaximisedWidth}px`};

  @media (max-width: ${PageWidthMediumThreshold}px) {
    width: 100%;
    max-width: ${SideMenuHiddenWidth}px;
  }

  padding: 0 0.5rem 1rem 0;
  padding-left: ${(props) => (props.$minimised ? '0.5rem' : '0')};
  margin: 0;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: ${PageWidthMediumThreshold}px) {
    background: var(--gradient-menu);
    transition: all var(--transition-duration);
    border-radius: 0.75rem;
  }

  section {
    &:first-child {
      flex-grow: 1;
    }

    > button {
      width: 100%;
      text-align: left;
    }

    > .inner {
      padding-left: ${(props) => (props.$minimised ? '0.1rem' : '0')};
      transition: opacity 0.15s;

      > button {
        width: 100%;
      }
    }
  }
`

export const LogoWrapper = styled.div<MinimisedProps>`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 3.5rem;
  padding-top: 1rem;
  position: relative;
  margin-left: 0.75rem;
  margin-bottom: 0.75rem;
  transition: transform 0.25s ease;

  > svg  {  
    position: relative;
    margin-left: ${(props) => (props.$minimised ? '0.8rem' : '0.3rem')};
    width: ${(props) => (props.$minimised ? '2.25rem' : '1.75em')};
    height: ${(props) => (props.$minimised ? '2.25rem' : '1.75rem')};
    top: ${(props) => (props.$minimised ? '0' : '0.1rem')};
  }

  > h3 {
    font-family: 'DM Serif Display', serif;
    color: var(--gray-1000);
    margin-left: 0.75rem;
    background-clip: text;
    display: flex;
    align-items: center;
    font-size: 1.6rem;
  }

  &:hover {
    transform: scale(1.02);
  }
`

export const ToggleWrapper = styled.button`
  position: absolute;
  top: 1.7rem;
  width: 1.3rem;
  height: 1.3rem;
  right: -0.75rem;
  display: flex;
  align-items: center;
  z-index: 10;

  @media(max-width: ${PageWidthMediumThreshold}px) {
    display: none;
  }

  > .label {
    background: var(--bg-primary);
    color: var(--gray-900);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
`
