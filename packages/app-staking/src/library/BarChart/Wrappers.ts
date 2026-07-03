// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const BarChartWrapper = styled.div<{ $lessPadding?: boolean }>`
  padding: ${(props) => (props.$lessPadding ? '0' : '0 0.5rem')};
  margin-top: 1.5rem;
  width: 100%;

  .available {
    display: flex;
    margin-top: 2.25rem;
    width: 100%;

    > div {
      display: flex;
      flex-flow: row wrap;
      padding: 0 0.35rem;
      &:first-child {
        padding-left: 0;
      }
      &:last-child {
        padding-right: 0;
      }
    }
  }
  .d1 {
    background: var(--gray-1000);
    color: var(--gray-100);

    ::selection {
      background-color: var(--accent-900);
    }
  }
  .d2 {
    background: var(--gray-900);
    color: var(--gray-100);
  }
  .d3 {
    background: var(--gray-800);
    color: var(--gray-100);
  }
  .d4 {
    background: var(--gray-400);
    color: var(--gray-900);
  }
`

export const Legend = styled.div`
  width: 100%;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: flex-end;
  height: 2.5rem;

  &.end {
    > h4 {
      flex-direction: row;
      flex-grow: 1;
      justify-content: flex-end;
      padding-right: 0;
    }
  }

  > h4 {
    font-family: var(--font-family-semibold);
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    margin: 0;
    padding: 0.5rem 1rem 0.25rem 1rem;

    &:first-child {
      padding-left: 0;
    }
    > span {
      width: 1rem;
      height: 1rem;
      margin-right: 0.5rem;
      border-radius: 0.25rem;
    }
  }
`

export const Bar = styled.div`
  background: var(--gray-300);
  border-radius: 0.65rem;
  display: flex;
  overflow: hidden;
  height: 3.75rem;
  width: 100%;

  > div {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    transition: width 1.5s cubic-bezier(0, 1, 0, 1);

    > span {
      font-family: var(--font-family-semibold);
      position: absolute;
      left: 0;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      padding: 0 0.8rem;
      width: 100%;
      font-size: 1.05rem;
    }
  }
`
