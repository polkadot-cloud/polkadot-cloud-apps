// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column wrap;
  width: 100%;

  .head {
    flex: 1;
    display: flex;
    flex-flow: row wrap;
    padding: 0 0.25rem;
    margin-top: 1rem;

    > h3 {
      flex: 1;
    }
  }
`

export const NominationRow = styled.section`
  width: 100%;

  & + & {
    margin-top: 1.5rem;
  }

  > h4 {
    color: var(--gray-900);
    font-family: var(--font-family-semibold);
    margin: 0 0 0.75rem;
    padding: 0 0.5rem;
  }
`
