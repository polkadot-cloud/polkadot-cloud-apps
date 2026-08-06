// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const RetainmentRow = styled.section``

export const MonthBadge = styled.time`
  color: var(--gray-900);
  font-family: var(--font-family-semibold);
  font-size: 0.85rem;
  line-height: 1;
  padding: 0.45rem 0;
  white-space: nowrap;
`

export const RetainmentBody = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: 0;
  flex: 1;
  min-height: 4rem;
  min-width: 0;
  width: 100%;

  > * {
    padding-inline: 1rem;
  }

  > *:first-child {
    padding-inline-start: 0;
  }

  > *:last-child {
    padding-inline-end: 0;
  }

  > * + * {
    border-inline-start: 1px solid var(--gray-500);
  }

  @container list-item-card (max-width: 31rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    > * {
      min-height: 4.5rem;
      padding: 0.85rem 0.9rem;
    }

    > *:nth-child(odd) {
      border-inline-start: 0;
      padding-inline-start: 0;
    }

    > *:nth-child(even) {
      padding-inline-end: 0;
    }

    > *:nth-child(n + 3) {
      border-block-start: 1px solid var(--gray-500);
    }
  }

  @container list-item-card (max-width: 21rem) {
    grid-template-columns: 1fr;

    > * {
      border-inline-start: 0;
      min-height: 4.25rem;
      padding: 0.9rem 0;
    }

    > * + * {
      border-block-start: 1px solid var(--gray-500);
    }
  }
`

export const FlowMetric = styled.div`
  display: grid;
  align-items: center;
  grid-template-rows: auto minmax(0, 1fr);
  justify-items: start;
  gap: 0.65rem;
  min-width: 0;
`

export const FlowLabel = styled.span`
  color: var(--text-tertiary);
  font-family: var(--font-family-semibold);
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
`

export const FlowValue = styled.strong<{ $color: string }>`
  color: ${(props) => props.$color};
  display: flex;
  align-items: baseline;
  justify-content: flex-start;
  line-height: 1;
  max-width: 100%;
  white-space: nowrap;

  > svg {
    font-size: 1rem;
    margin-right: 0.45rem;
  }

  > span {
    font-family: var(--font-family-mono);
    font-size: clamp(1.25rem, 3.5cqi, 1.65rem);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    letter-spacing: -0.035em;
  }

  > small {
    color: var(--gray-1000);
    font-family: var(--font-family-semibold);
    font-size: 0.78rem;
    margin-left: 0.35rem;
  }
`
