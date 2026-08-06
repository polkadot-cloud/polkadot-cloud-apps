// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'
import { BasicItemWrapper } from '../../BasicItem/Wrappers'

export const ItemWrapper = styled(BasicItemWrapper)`
  container-name: list-item-card;
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

  @container list-item-card (max-width: 31rem) {
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

  @container list-item-card (max-width: 21rem) {
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
