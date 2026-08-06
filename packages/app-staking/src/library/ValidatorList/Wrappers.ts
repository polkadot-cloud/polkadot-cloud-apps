// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Wrapper } from 'library/ListItem/Wrappers'
import styled from 'styled-components'

export const ListFormatSwitch = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 1199px) {
    display: none;
  }
`

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
    padding: 0.75rem 1.5rem 0.65rem;
  }

  > .inner > .card-top > .row.performance {
    align-items: stretch;
    flex: 0 0 auto;
    flex-direction: column;
    height: 11rem;
    padding: 0.75rem 1.1rem 0.85rem;
  }

  > .inner > .row.retainment {
    align-items: stretch;
    background: transparent;
    flex: 0 0 auto;
    flex-direction: column;
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

export const HeaderMetricsAction = styled(HeaderIconAction)`
  flex: 0 0 auto;
  width: auto;

  && button {
    font-family: var(--font-family-semibold);
    font-size: 0.95rem;
    letter-spacing: normal;
    padding: 0 0.85rem !important;
    width: auto !important;
  }
`

export const ValidatorMenuWrapper = styled.div`
  flex: 0 0 2.25rem;
  height: 2.25rem !important;
  position: relative;
  width: 2.25rem;
`

export const ValidatorMenuTrigger = styled.button`
  background: transparent !important;
  border: 1px solid var(--gray-500);
  border-radius: 0.55rem !important;
  color: var(--gray-800);
  display: grid;
  height: 2.25rem !important;
  margin: 0 !important;
  padding: 0 !important;
  place-items: center;
  width: 2.25rem !important;

  &:hover,
  &[aria-expanded='true'] {
    background: var(--gray-300) !important;
    opacity: 1;
  }

  &:focus-visible {
    border-color: var(--gray-900);
    outline: 2px solid
      color-mix(in srgb, var(--gray-1000) 18%, transparent);
    outline-offset: 1px;
  }

  > svg {
    color: var(--gray-800) !important;
    font-size: 0.85rem;
    transition: transform var(--transition-duration) ease;
  }

  &[aria-expanded='true'] > svg {
    transform: rotate(180deg);
  }
`

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

  }

  @container validator-card (max-width: 21rem) {
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

export const PerformanceRow = styled.section``

export const SectionHeader = styled.header`
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
  min-width: 0;
  width: 100%;

  > strong {
    color: var(--gray-900);
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

export const BarWrapper = styled(Wrapper)`
  container-name: validator-bar;
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

  @container validator-bar (max-width: 74rem) {
    grid-template-columns: minmax(0, 1fr) auto;
    row-gap: 0.8rem;
  }

  @container validator-bar (max-width: 38rem) {
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
  grid-template-columns: repeat(7, minmax(4.75rem, 1fr));
  min-width: 0;

  > * + * {
    border-inline-start: 1px solid var(--gray-500);
  }

  @container validator-bar (max-width: 74rem) {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  @container validator-bar (max-width: 46rem) {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    > *:nth-child(5) {
      border-inline-start: 0;
    }

    > *:nth-child(n + 5) {
      border-block-start: 1px solid var(--gray-500);
      padding-block-start: 0.7rem;
    }
  }

  @container validator-bar (max-width: 38rem) {
    grid-row: 3;
  }

  @container validator-bar (max-width: 29rem) {
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
