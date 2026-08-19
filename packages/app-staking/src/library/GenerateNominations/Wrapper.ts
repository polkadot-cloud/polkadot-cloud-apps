// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'
import { CardWrapper } from 'ui-app/Card'
import { Loader } from 'ui-core/base'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;

  > div:last-child {
    width: 100%;
  }
`

export const StandaloneCards = styled(Wrapper)`
  flex-flow: column nowrap;

  > ${CardWrapper} {
    flex: 0 0 auto;
    width: 100%;

    &.transparent {
      overflow: visible;
    }
  }
`

export const NominationsLoader = styled(Loader)<{ $standalone?: boolean }>`
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

export const AccountPrompt = styled.section`
  align-items: flex-start;
  display: flex;
  flex-flow: column nowrap;
  gap: 0.25rem;
  margin-top: 1.4rem;
  padding: 0.25rem;

  h3 {
    margin: 0;
  }
`

export const NominationHealthWrapper = styled.section<{
	$standalone?: boolean
}>`
  display: grid;
  gap: 1rem;
  margin: ${({ $standalone }) =>
		$standalone ? '0 0.9rem 1rem' : '1.5rem 0.9rem 1rem'};
  width: calc(100% - 1.8rem);
`
