// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'
import { CardWrapper } from 'ui-app/Card'
import { Loader } from 'ui-core/base'
import type { StandaloneStyleProps } from './types'

export const NominationEditorWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;

  > div:last-child {
    width: 100%;
  }
`

export const StandaloneCards = styled(NominationEditorWrapper)`
  flex-flow: column nowrap;

  > ${CardWrapper} {
    flex: 0 0 auto;
    width: 100%;

    &.transparent {
      overflow: visible;
    }
  }
`

export const NominationsLoader = styled(Loader)<StandaloneStyleProps>`
  height: 5.5rem;
  margin: 0.9rem;
  width: calc(100% - 1.8rem);

  ${({ $standalone }) =>
		$standalone &&
		`
    .light & {
      --shimmer-fg: var(--gray-400);
      --shimmer-bg: var(--gray-500);
    }

    .dark & {
      --shimmer-fg: var(--gray-300);
      --shimmer-bg: var(--gray-500);
    }
  `}
`

export const StandalonePreloader = styled(NominationsLoader)`
  margin-top: 1.4rem;

  .light & {
    --shimmer-fg: var(--gray-500);
    --shimmer-bg: var(--gray-600);
  }

  .dark & {
    --shimmer-fg: var(--gray-200);
    --shimmer-bg: var(--gray-400);
  }
`

export const NominationHealthWrapper = styled.section<StandaloneStyleProps>`
  display: grid;
  gap: 1rem;
  margin: ${({ $standalone }) =>
		$standalone ? '0 0.9rem 1rem' : '1.5rem 0.9rem 1rem'};
  width: calc(100% - 1.8rem);
`
