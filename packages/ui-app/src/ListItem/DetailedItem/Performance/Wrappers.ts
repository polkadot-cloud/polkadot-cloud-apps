// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const PerformanceRow = styled.section``

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
