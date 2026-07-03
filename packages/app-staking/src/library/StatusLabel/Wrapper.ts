// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'
import type { WrapperProps } from './types'

export const Wrapper = styled.div<WrapperProps>`
  position: absolute;
  top: ${(props) => (props.$topOffset ? props.$topOffset : '50%')};
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;

  > div {
    background: var(--bg-primary);
    box-shadow: var(--shadow);
    min-width: 125px;
    opacity: ${(props) =>
			props.$backgroundOpacity === undefined ? 0.75 : props.$backgroundOpacity};
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;

    > svg {
      color: var(--gray-900);
    }
    h2 {
      padding: 0;
      margin: 0;
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      font-size: 1.2rem;
      opacity: 0.75;
    }
  }
`
