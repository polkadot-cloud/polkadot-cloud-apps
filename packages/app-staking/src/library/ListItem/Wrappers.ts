// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  --height-top-row: 3.25rem;
  --height-bottom-row: 5rem;
  --item-border-width: 1.25px;

  &.member {
    --height-bottom-row: 2.75rem;
  }
  &.pool {
    --height-bottom-row: 3.25rem;
  }

  --height-total: calc(var(--height-top-row) + var(--height-bottom-row));

  height: var(--height-total);
  display: flex;
  flex-flow: row wrap;
  position: relative;
  margin: 0.5rem;
  width: 100%;

  > .inner {
    background: var(--bg-list);
    border: var(--item-border-width) solid var(--bg-list);

    &.canvas {
      background: var(--gray-300);
      border: var(--item-border-width) solid var(--gray-400)
    }

    &.canvas {
      box-shadow: none;
    }

    border-radius: 0.75rem;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    overflow: hidden;
    position: absolute;
    padding: 0;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    transition: border var(--transition-duration) ease;

    &.selected {
      border-color: var(--gray-1000);
    }

    .row {
      flex: 1 0 100%;
      display: flex;
      align-items: center;
      padding: 0 0.5rem;

      &.top {
        height: var(--height-top-row);
        > div {
          height: inherit;
          display: flex;
          align-items: center;
        }
      }

      &.bottom {
        height: var(--height-bottom-row);

        &.pools {
          align-items: flex-start;
        }

        &.lg {
          display: flex;
          align-items: center;

          > div {
            &:first-child {
              flex-grow: 1;
              padding: 0 0.25rem;
            }
            &:last-child {
              flex-shrink: 1;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
            }
          }
        }
      }
    }
  }
`

export const ValidatorStatusWrapper = styled.div<{
	$status: string
	$noMargin?: boolean
}>`
  margin-right: ${(props) => (props.$noMargin ? '0' : '0.35rem')};
  padding: 0 0.5rem;

  h5 {
    color: ${(props) =>
			props.$status === 'active' ? 'var(--status-success)' : 'var(--gray-900)'};
    opacity: ${(props) => (props.$status === 'active' ? 0.8 : 0.5)};
    display: flex;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

export const PoolStatusWrapper = styled.div<{
	$status: string
}>`
  h4,
  h5 {
    display: flex;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  h4 {
    color: var(--text-tertiary);
    font-size: 1rem;

    padding-top: ${(props) =>
			props.$status === 'active' ? '0.15rem' : '0.25rem'};

    > span {
      color: ${(props) =>
				props.$status === 'active'
					? 'var(--status-success)'
					: 'var(--text-tertiary)'};

      border: 0.75px solid
        ${(props) =>
					props.$status === 'active' ? 'var(--status-success)' : 'transparent'};

      padding: ${(props) => (props.$status === 'active' ? '0 0.5rem' : '0')};
      border-radius: 0.3rem;
      opacity: ${(props) => (props.$status === 'active' ? 1 : 0.6)};
    }
  }
`
