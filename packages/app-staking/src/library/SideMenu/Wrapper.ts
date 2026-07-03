// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
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
  background: ${(props) => (props.$minimised && !props.$advancedMode ? 'var(--bg-min-side-menu)' : 'none')};
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
      padding-left: ${(props) => (props.$advancedMode ? '0' : props.$minimised ? '0.1rem' : '0')};
      transition: opacity 0.15s;
      > button {
        width: 100%;
      }
    }
  }
`

export const CategoryHeader = styled.h3`
  color: var(--gray-1000);
  border-bottom: 1px solid var(--gray-1000);
  font-family: var(--font-family-semibold);
  margin: 1.12rem 0.75rem 0.75rem 0.25rem;
  padding-bottom: 0.78rem;
  padding-left: 0.55rem;
  width: 100%;
  display: flex;
  transition: all 0.2s;


  &:hover {
    color: var(--accent-800);
    border-color: var(--accent-800);
  }
  
  > span {
    &:first-child {
      flex-grow: 1
    }
    &:first-child {
      align-self: flex-end;
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
  margin-left: ${(props) => (props.$minimised ? '0.75rem' : '0.75rem')};
  margin-bottom: ${(props) => (props.$advancedMode ? '0.25rem' : '0.75rem')};
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

export const BulletWrapper = styled.div`
  color: var(--status-success);
  display: flex;
  flex: 1;
  font-size: 0.88rem;
  flex-flow: row wrap;
  justify-content: flex-end;
  margin-right: 0.4rem;
  opacity: 0.7;

  > span {
    &.success {
      color: var(--status-success);
      border: 1px solid var(--status-success);
    }
    &.warning {
      color: var(--status-warning);
      border: 1px solid var(--status-warning);
    }
    border-radius: 0.5rem;
    padding: 0.15rem 0.5rem;
  }

  &.accent {
    svg {
      color: var(--gray-1000);
    }
  }
  &.success {
    svg {
      color: var(--status-success);
    }
  }
  &.warning {
    svg {
      color: var(--status-warning);
    }
  }
  &.danger {
    svg {
      color: var(--status-danger);
    }
  }
  &.minimised {
    > svg {
      flex: 0;
      position: absolute;
      right: -3px;
      top: -4px;
    }
  }
`

export const BarLogoWrapper = styled.div`
  width: calc(100% - 2rem);
  display: flex;
  justify-content: center;
  margin: 0.75rem auto 0 auto;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  height: 2.8rem;
  transition: transform 0.25s ease;

  &:hover {
    transform: scale(1.05);
  }

  > svg {
    height: 2.15rem;
    
    path {
      fill: white;
      width: auto;
      height: 100%;
    }
  }
`

export const BarIconsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-top: 0.9rem;
  flex-grow: 1;

  > section {
    margin-bottom: 1rem;
    width: calc(100% - 1.6rem);
  }
`

export const BarButton = styled.button`
  width: 100%;
  padding: 0.95rem 0;
  border-radius: 1rem;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  &.active {
    background: rgba(255, 255, 255, 0.18);
  }

  > svg {
    color: white;
    height: 1.65rem;
    margin: 0 0.25rem;
  }
`

export const BarFooterWrapper = styled.div`
  width: calc(100% - 1.6rem);
  margin: 0 auto;
  padding: 1rem 0;
`
