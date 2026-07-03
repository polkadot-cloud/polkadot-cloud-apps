// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const TwoThreshold = 800
export const ThreeRowThreshold = 1300

const TwoThresholdMin = TwoThreshold + 1
const ThreeRowThresholdMin = ThreeRowThreshold + 1

// The outer container of select items.
// Removes the outer padding for 2 and 3 row layouts.
export const SelectItemsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;

  &.two-col {
    /* Remove outer padding for 2-per-row layout */
    @media (min-width: ${TwoThresholdMin}px) {
      > div:nth-child(2n) {
        padding-right: 0;
      }
      > div:nth-child(2n + 1) {
        padding-left: 0;
      }
    }
  }

  &.three-col {
    /* Remove outer padding for 2-per-row layout */
    @media (min-width: ${TwoThresholdMin}px) and (max-width: ${ThreeRowThreshold}px) {
      > div:nth-child(2n) {
        padding-right: 0;
      }
      > div:nth-child(2n + 1) {
        padding-left: 0;
      }
    }
    /* Remove outer padding for 3-per-row layout */
    @media (min-width: ${ThreeRowThresholdMin}px) {
      > div:nth-child(3n) {
        padding-right: 0;
      }
      > div:nth-child(3n + 1) {
        padding-left: 0;
      }
    }
  }
`

// Item and surrounding padded area.
export const Wrapper = styled.div<{
	$selected?: boolean
	$grow: boolean
	$hoverBorder: boolean
}>`
  padding: 0.6rem;
  width: 100%;
  flex-grow: ${(props) => (props.$grow ? 1 : 0)};

  &.two-col {
    width: 50%;
    /* flex basis for 3-per-row layout */
    @media (max-width: ${TwoThreshold}px) {
      width: 100%;
    }
  }

  &.three-col {
    width: 33.33%;
    /* flex basis for 2-per-row layout */
    @media (min-width: ${TwoThreshold}px) and (max-width: ${ThreeRowThreshold}px) {
      width: 50%;
    }
    /* flex basis for 3-per-row layout */
    @media (max-width: ${TwoThreshold}px) {
      width: 100%;
    }
  }

  > .inner {
    transition: border var(--transition-duration);
    background: var(--bg-primary);
    border: 1.75px solid
      ${(props) => (props.$selected ? 'var(--gray-1000)' : 'var(--gray-500)')};
    border-radius: 1rem;
    width: 100%;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: ${(props) =>
				props.$hoverBorder
					? 'var(--gray-1000)'
					: props.$selected
						? 'var(--gray-1000)'
						: 'var(--gray-500)'};
    }

    > button {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      text-align: left;
      display: flex;
      flex-flow: row wrap;
      align-items: center;

      &:disabled {
        opacity: var(--opacity-disabled);
      }

      > .icon {
        background: var(--bg-list);
        color: var(--gray-1000);
        width: 6rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      > .body {
        flex: 1;
        display: flex;
        flex-flow: column wrap;
        justify-content: center;
        padding: 1.25rem 1.35rem;
        overflow: hidden;

        h3 {
          font-family: var(--font-family-semibold);
          padding: 0;
          margin: 0;
        }

        p {
          padding: 0;
          margin: 0.4rem 0 0 0;
        }
      }

      > .toggle {
        color: ${(props) =>
					props.$selected ? 'var(--gray-1000)' : 'var(--gray-900)'};
        opacity: ${(props) => (props.$selected ? 1 : 0.5)};
        width: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
`
