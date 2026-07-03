// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  border-radius: 1rem;
  width: 100%;

  .items {
    position: relative;
    padding: 0.5rem 0 0rem 0;
    border-bottom: none;
    width: auto;
    border-radius: 0.75rem;
    z-index: 1;
    width: 100%;

    h4 {
      margin: 0.2rem 0;
    }

    .arrow {
      color: var(--gray-1000);
    }
  }
`

export const SliderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0.5rem 0 0.5rem;

  h5 {
    font-family: var(--font-family-semibold);
    margin: 0;
    margin-left: 0.75rem;

    > span {
      margin-left: 0.75rem;
    }
    &.neutral,
    .neutral {
      color: var(--gray-1000);
      opacity: 0.8;
    }
    &.danger,
    .danger {
      color: var(--status-danger);
    }
    &.success,
    .success {
      color: var(--status-success);
    }
  }

  > div:first-child {
    display: flex;
    align-items: center;
    margin: 1.25rem 0 0.5rem 0;

    h2 {
      margin: 0;
      font-family: var(--font-family-bold);
    }
  }

  .changeRate {
    display: flex;
    flex-wrap: wrap;
    margin: 0.25rem 0;
  }

  > div {
    display: flex;
    align-items: center;

    > .slider {
      flex-grow: 1;

      &.no-value {
        padding-left: 0;
      }

      .rc-slider-handle-dragging {
        box-shadow: 0 !important;
      }
    }
  }

  .stats {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 1rem;
    h2 {
      border-bottom: 1px solid var(--gray-500);
      font-family: var(--font-family-bold);
      margin-top: 0rem;
      padding-bottom: 1rem;
    }
  }

  .done {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .confirm {
    display: flex;
    flex-flow: column wrap;
    align-items: flex-end;
    margin-top: 2.5rem;
  }
`

export const TaskInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  h3,
  p {
    text-align: left;
    margin: 0;
  }

  h3 {
    font-family: var(--font-family-semibold);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--gray-1000);
    font-size: 1rem;
  }
`
