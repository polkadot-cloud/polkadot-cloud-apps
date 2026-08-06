// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const BasicItemWrapper = styled.div`
  --height-top-row: 3.25rem;
  --height-bottom-row: 5.5rem;
  --item-border-width: 1.25px;

  &.member {
    --height-bottom-row: 3.75rem;
  }

  &.pool {
    --height-bottom-row: 3.25rem;
  }

  --height-total: calc(var(--height-top-row) + var(--height-bottom-row));

  display: flex;
  flex-flow: row wrap;
  height: var(--height-total);
  margin: 0.5rem;
  position: relative;
  width: 100%;

  > .inner {
    align-items: center;
    background: var(--bg-list);
    border: var(--item-border-width) solid var(--bg-list);
    border-radius: 0.75rem;
    display: flex;
    flex-flow: row wrap;
    height: 100%;
    left: 0;
    overflow: hidden;
    padding: 0;
    position: absolute;
    top: 0;
    transition: border var(--transition-duration) ease;
    width: 100%;

    &.canvas {
      background: var(--gray-300);
      border: var(--item-border-width) solid var(--gray-400);
      box-shadow: none;
    }

    &.selected {
      border-color: var(--gray-1000);
    }

    .row {
      align-items: center;
      display: flex;
      flex: 1 0 100%;
      padding: 0 0.5rem;

      &.top {
        height: var(--height-top-row);

        > div {
          align-items: center;
          display: flex;
          height: inherit;
        }
      }

      &.bottom {
        height: var(--height-bottom-row);
        padding: 0.25rem 0.25rem 0;

        &.pools {
          align-items: flex-start;
        }

        &.lg {
          align-items: center;
          display: flex;

          > div:first-child {
            flex-grow: 1;
            padding: 0 0.25rem;
          }

          > div:last-child {
            align-items: flex-end;
            display: flex;
            flex-direction: column;
            flex-shrink: 1;
          }
        }
      }
    }
  }
`

export const PoolStatusWrapper = styled.div<{ $status: string }>`
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
      border: 0.75px solid
        ${(props) =>
					props.$status === 'active' ? 'var(--status-success)' : 'transparent'};
      border-radius: 0.3rem;
      color: ${(props) =>
				props.$status === 'active'
					? 'var(--status-success)'
					: 'var(--text-tertiary)'};
      opacity: ${(props) => (props.$status === 'active' ? 1 : 0.6)};
      padding: ${(props) => (props.$status === 'active' ? '0 0.5rem' : '0')};
    }
  }
`
