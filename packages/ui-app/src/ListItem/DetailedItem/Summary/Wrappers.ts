// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const SummaryRow = styled.section`
  gap: 0;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  > * {
    border-block-end: 1px solid var(--gray-500);
    padding-block-end: 0.75rem;
    padding-inline: 0.75rem;
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
      min-height: 3.4rem;
      padding: 0.75rem 0.9rem;
    }

    > *:nth-child(odd) {
      border-inline-start: 0;
      padding-inline-start: 0;
    }

    > *:nth-child(even) {
      padding-inline-end: 0;
    }
  }

  @container list-item-card (max-width: 21rem) {
    grid-template-columns: 1fr;

    > * {
      border-inline-start: 0;
      min-height: 3.2rem;
      padding: 0.75rem 0;
    }
  }
`

export const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
`

export const SummaryLabel = styled.span`
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  font-family: var(--font-family-semibold);
  font-size: 0.9rem;
  gap: 0.4rem;
  letter-spacing: 0.055em;
  line-height: 1;
  margin-bottom: 0.65rem;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
`

export const SummaryValue = styled.strong`
  color: var(--gray-1000);
  display: flex;
  align-items: baseline;
  font-family: var(--font-family-mono);
  font-size: clamp(1.08rem, 3cqi, 1.35rem);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  gap: 0.3rem;
  letter-spacing: -0.035em;
  line-height: 1.15;
  min-width: 0;
  white-space: nowrap;

  > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export const SummaryUnit = styled.span`
  color: var(--text-tertiary);
  flex: 0 0 auto;
  font-family: var(--font-family-semibold);
  font-size: 0.78rem;
  font-weight: normal;
  letter-spacing: 0;
`

export const SummaryStatusDot = styled.span<{ $active: boolean }>`
  background: ${(props) =>
		props.$active ? 'var(--status-success)' : 'var(--text-tertiary)'};
  border-radius: 50%;
  flex: 0 0 0.45rem;
  height: 0.45rem;
  width: 0.45rem;
`
