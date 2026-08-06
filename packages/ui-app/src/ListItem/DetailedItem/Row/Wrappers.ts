// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'
import { BasicItemWrapper } from '../../BasicItem/Wrappers'
import { HeaderActions, HeaderIdentity } from '../Header/Wrappers'

export const BarWrapper = styled(BasicItemWrapper)`
  container-name: list-item-bar;
  container-type: inline-size;
  height: auto;
  margin: 0.45rem 0.9rem;
  width: calc(100% - 1.8rem);

  > .inner,
  > .inner.canvas {
    align-items: stretch;
    background: color-mix(in srgb, var(--bg-primary) 97.5%, black);
    border: 0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 8px -7px rgb(0 0 0 / 45%);
    display: grid;
    height: auto;
    inset: auto;
    min-height: 5.5rem;
    overflow: visible;
    position: relative;
  }
`

export const BarLayout = styled.div`
  align-items: center;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(25rem, 1.8fr) minmax(0, 4fr) auto;
  min-width: 0;
  padding: 0.75rem 1rem;
  width: 100%;

  @container list-item-bar (max-width: 74rem) {
    grid-template-columns: minmax(0, 1fr) auto;
    row-gap: 0.8rem;
  }

  @container list-item-bar (max-width: 38rem) {
    grid-template-columns: minmax(0, 1fr);

    > ${HeaderActions} {
      grid-column: 1;
      grid-row: 2;
      justify-content: flex-start;
    }
  }
`

export const BarIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;

  > ${HeaderIdentity} {
    min-width: 0;
  }

  > ${HeaderIdentity} > div > div:first-child {
    height: 2.25rem;
    max-width: 2.25rem !important;
    min-width: 2.25rem !important;
  }

  > ${HeaderIdentity} > div > div:last-child > h4 {
    font-size: 1rem;
  }
`

export const BarPerformanceGraph = styled.div`
  background: color-mix(in srgb, var(--gray-400) 48%, transparent);
  border-radius: 0.3rem;
  flex: 0 0 clamp(12rem, 18cqi, 18rem);
  height: 3.6rem;
  margin-inline-end: 0.5rem;
  min-width: 0;
  overflow: hidden;

  && > div {
    background: transparent;
    border: 0;
    border-radius: inherit;
    height: 100%;
    max-width: none;
    width: 100%;
  }

  && > div > div:last-child {
    box-sizing: border-box;
    height: 100%;
    padding: 0.2rem 0.25rem;
  }

  && svg {
    display: block;
    height: 100%;
    shape-rendering: geometricPrecision;
    width: 100%;
  }

  && svg line[stroke-width='1'] {
    stroke: color-mix(in srgb, var(--gray-700) 18%, transparent);
  }
`

export const BarStats = styled.div`
  align-items: stretch;
  display: grid;
  grid-template-columns:
    repeat(6, minmax(4.75rem, 1fr))
    minmax(7.5rem, 1.35fr)
    minmax(4.75rem, 1fr);
  min-width: 0;

  > * + * {
    border-inline-start: 1px solid var(--gray-500);
  }

  @container list-item-bar (max-width: 74rem) {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  @container list-item-bar (max-width: 46rem) {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    > *:nth-child(5) {
      border-inline-start: 0;
    }

    > *:nth-child(n + 5) {
      border-block-start: 1px solid var(--gray-500);
      padding-block-start: 0.7rem;
    }
  }

  @container list-item-bar (max-width: 38rem) {
    grid-row: 3;
  }

  @container list-item-bar (max-width: 29rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    > *:nth-child(odd) {
      border-inline-start: 0;
    }

    > *:nth-child(n + 3) {
      border-block-start: 1px solid var(--gray-500);
      padding-block-start: 0.7rem;
    }
  }
`

export const BarStat = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding-inline: clamp(0.5rem, 1.1cqi, 0.85rem);

  &:first-child {
    padding-inline-start: 0;
  }
`

export const BarStatLabel = styled.span`
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  font-family: var(--font-family-semibold);
  font-size: 0.8rem;
  gap: 0.3rem;
  letter-spacing: 0.045em;
  line-height: 1;
  margin-bottom: 0.7rem;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
`

export const BarStatValue = styled.strong<{ $color?: string }>`
  color: ${(props) => props.$color ?? 'var(--gray-1000)'};
  display: flex;
  align-items: baseline;
  font-family: var(--font-family-mono);
  font-size: clamp(1.05rem, 1.9cqi, 1.22rem);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  gap: 0.25rem;
  letter-spacing: -0.025em;
  line-height: 1.1;
  min-width: 0;
  white-space: nowrap;

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  > small {
    color: var(--text-tertiary);
    flex: 0 0 auto;
    font-family: var(--font-family-semibold);
    font-size: 0.7rem;
    font-weight: normal;
    letter-spacing: 0;
  }

  > svg {
    flex: 0 0 auto;
    font-size: 0.85rem;
  }
`
