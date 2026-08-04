// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Wrapper } from 'library/ListItem/Wrappers'
import styled from 'styled-components'

export const ItemWrapper = styled(Wrapper)`
  container-name: validator-card;
  container-type: inline-size;
  height: auto;
  margin: 0.9rem;
  width: calc(100% - 1.8rem);

  > .inner,
  > .inner.canvas {
    align-items: stretch;
    background: color-mix(in srgb, var(--bg-primary) 97.5%, black);
    border: 0;
    border-radius: 0.5rem;
    box-shadow: 0 5px 8px -7px rgb(0 0 0 / 45%);
    height: auto;
    inset: auto;
    overflow: hidden;
    position: relative;
    flex-flow: column nowrap;
  }

  > .inner > .card-top > .row.top {
    flex: 0 0 auto;
    gap: 0.45rem;
    height: auto;
    min-height: 3.75rem;
    overflow: visible;
    padding: 0.55rem 1rem 0.6rem;
  }

  > .inner > .card-top > .row.summary {
    display: grid;
    flex: 0 0 auto;
    min-height: 5.75rem;
    padding: 0.75rem 1.5rem 1.35rem;
  }

  > .inner > .card-top > .row.performance {
    align-items: stretch;
    flex: 0 0 auto;
    flex-direction: column;
    height: 11rem;
    padding: 1rem 1.1rem 0.85rem;
  }

  > .inner > .row.retainment {
    align-items: stretch;
    background: transparent;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 1.75rem;
    min-height: 9rem;
    padding: 0.75rem 1rem 1.25rem;
  }

  @container validator-card (max-width: 31rem) {
    > .inner > .card-top > .row.top {
      align-content: center;
      flex-wrap: wrap;
      padding-bottom: 1rem;
    }

    > .inner > .card-top > .row.summary {
      min-height: 8.5rem;
    }

    > .inner > .card-top > .row.performance {
      height: 10rem;
    }

    > .inner > .row.retainment {
      min-height: 14rem;
    }
  }

  @container validator-card (max-width: 21rem) {
    > .inner > .card-top > .row.top,
    > .inner > .card-top > .row.summary,
    > .inner > .card-top > .row.performance,
    > .inner > .row.retainment {
      padding-left: 0.9rem;
      padding-right: 0.9rem;
    }

    > .inner > .card-top > .row.summary,
    > .inner > .row.retainment {
      min-height: 0;
    }
  }
`

export const CardTop = styled.div`
  background: transparent;
  border-bottom: 1px solid var(--gray-500);
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  min-width: 0;
  width: 100%;
`

export const HeaderIdentity = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  gap: 0.6rem;
  height: auto !important;
  min-width: 9rem;

  > div {
    flex: 1 1 auto;
    margin: 0;
    min-width: 0;
    overflow: visible;
  }

  > div > div:first-child {
    background: transparent;
    border: 0 !important;
    border-radius: 0;
    display: grid;
    height: 2.5rem;
    max-width: 2.5rem !important;
    min-width: 2.5rem !important;
    overflow: visible;
    place-items: center;
  }

  && > div > div:last-child {
    height: auto;
    min-width: 0;
    padding-left: 0.45rem;
  }

  && > div > div:last-child > h4 {
    color: var(--gray-1000);
    font-family: var(--font-family-bold);
    font-size: clamp(0.95rem, 2.4cqi, 1.2rem);
    height: auto;
    line-height: 1.2;
    overflow: hidden;
    padding: 0;
    position: static;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
`

export const BlockedBadge = styled.span`
  background: color-mix(in srgb, var(--status-danger) 8%, transparent);
  border: 1px solid
    color-mix(in srgb, var(--status-danger) 22%, transparent);
  border-radius: 0.55rem;
  color: var(--status-danger);
  flex: 0 0 auto;
  font-family: var(--font-family-semibold);
  font-size: 0.62rem;
  letter-spacing: 0.04em;
  padding: 0.35rem 0.5rem;
  text-transform: uppercase;
`

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 0.35rem;
  height: auto !important;
  overflow: visible;

  @container validator-card (max-width: 31rem) {
    flex-basis: 100%;
    justify-content: flex-end;
  }
`

export const HeaderIconAction = styled.div`
  flex: 0 0 2.25rem;
  height: 2.25rem;
  position: relative;
  width: 2.25rem;

  && div {
    margin: 0;
  }

  && button,
  && > span {
    background: transparent !important;
    border: 1px solid var(--gray-500);
    border-radius: 0.55rem !important;
    color: var(--gray-800);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.25rem !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 2.25rem !important;
  }

  && button:focus-visible,
  && > span:focus-visible {
    border-color: var(--gray-900);
    outline: 2px solid
      color-mix(in srgb, var(--gray-1000) 18%, transparent);
    outline-offset: 1px;
  }

  && button:hover,
  && > span:hover {
    background: var(--gray-300) !important;
    opacity: 1;
  }

  && button > span {
    justify-content: center;
    width: 100% !important;
  }

  && svg {
    color: var(--gray-800) !important;
    height: 1.2rem !important;
    width: 1.2rem !important;
  }
`

export const HeaderMetricsAction = styled.div`
  flex: 0 0 auto;
  height: 2.25rem;

  && div {
    margin: 0;
  }

  && button {
    background: color-mix(
      in srgb,
      var(--gray-500) 80%,
      var(--gray-400)
    ) !important;
    border-radius: 0.65rem !important;
    color: var(--gray-1000);
    font-family: var(--font-family-semibold);
    font-size: 0.95rem;
    height: 2.25rem !important;
    letter-spacing: normal;
    padding: 0 0.85rem !important;
    width: auto !important;
  }

  && button:hover {
    background: color-mix(
      in srgb,
      var(--gray-500) 75%,
      var(--gray-600)
    ) !important;
    opacity: 1;
  }

  && button:active {
    background: var(--gray-600) !important;
    opacity: 1;
  }

  && button:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--gray-1000) 18%, transparent);
    outline-offset: 1px;
  }
`

export const SummaryRow = styled.section`
  gap: 0;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  > * {
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

  @container validator-card (max-width: 31rem) {
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

    > *:nth-child(n + 3) {
      border-block-start: 1px solid var(--gray-500);
    }
  }

  @container validator-card (max-width: 21rem) {
    grid-template-columns: 1fr;

    > * {
      border-inline-start: 0;
      min-height: 3.2rem;
      padding: 0.75rem 0;
    }

    > * + * {
      border-block-start: 1px solid var(--gray-500);
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

export const PerformanceRow = styled.section``

export const PerformanceHeader = styled.header`
  display: flex;
  align-items: baseline;
  flex: 0 0 auto;
  margin-bottom: 0.8rem;
  width: 100%;

  > strong {
    color: var(--gray-1000);
    font-family: var(--font-family-bold);
    font-size: 1.15rem;
  }
`

export const PerformanceGraph = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;

  && > div {
    background: transparent;
    border: 0;
    border-radius: 0.45rem;
    height: 100%;
    max-width: none;
    overflow: hidden;
  }

  && > div > div:last-child {
    box-sizing: border-box;
    height: 100%;
    padding: 0.45rem 0.5rem;
  }

  && svg {
    display: block;
    height: 100%;
    shape-rendering: geometricPrecision;
    width: 100%;
  }

  && svg line[stroke-width='1'] {
    stroke: color-mix(in srgb, var(--gray-700) 22%, transparent);
  }
`

export const RetainmentRow = styled.section``

export const RetainmentHeader = styled.header`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.7rem;
  min-width: 0;
  width: 100%;
`

export const RetainmentTitle = styled.strong`
  color: var(--gray-1000);
  font-family: var(--font-family-bold);
  font-size: 1.2rem;
  margin-right: 0.15rem;
`

export const RetainmentBadges = styled.div`
  display: flex;
  align-items: center;
  background: color-mix(in srgb, var(--bg-primary) 98%, black);
  border: 1px solid var(--gray-500);
  border-radius: 0.65rem;
  flex-wrap: nowrap;
  margin-inline-start: auto;
  min-width: 0;
  overflow: hidden;
`

export const MonthBadge = styled.time`
  background: transparent;
  border-inline-start: 1px solid var(--gray-500);
  color: var(--gray-900);
  font-family: var(--font-family-semibold);
  font-size: 0.95rem;
  letter-spacing: normal;
  line-height: 1;
  padding: 0.65rem 0.85rem;
  white-space: nowrap;
`

export const IdentityCount = styled.span`
  color: var(--gray-900);
  font-family: var(--font-family-semibold);
  font-size: 0.95rem;
  letter-spacing: normal;
  line-height: 1;
  overflow: hidden;
  padding: 0.65rem 0.85rem;
  text-overflow: ellipsis;
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

  @container validator-card (max-width: 31rem) {
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

  @container validator-card (max-width: 21rem) {
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
  grid-template-rows: minmax(0, 1fr) auto;
  justify-items: center;
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
  justify-content: center;
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
