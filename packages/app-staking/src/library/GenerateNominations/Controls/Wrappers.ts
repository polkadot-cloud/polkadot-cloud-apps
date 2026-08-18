// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const MenuWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  background: rgb(from var(--gray-300) r g b / 75%);

  @media (max-width: 1200px) {
    padding: 0 1.5rem;
  }

  > .inner {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    padding: 0.4rem 0;
    align-items: center;

    > button {
      margin-right: 2.25rem;
    }

    > .actions {
      align-items: center;
      display: flex;
      gap: 0.5rem;
      margin-left: auto;
      flex-shrink: 0;

      > button {
        display: flex;
      }

      .revert {
        background: var(--gray-400);
        border-color: var(--gray-400);
        border-radius: var(--btn-sm-radius);
      }
    }
  }
`
