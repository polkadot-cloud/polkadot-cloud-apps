// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
  padding-bottom: 1.5rem;

  &.margin {
    margin-top: 1rem;
  }

  > .inner {
    background: var(--bg-modal-footer);
    box-shadow: 0px 6px 9px var(--shadow-secondary);
    border-radius: 1.25rem;
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 0.7rem;

    @media (width < 600px) {
      flex-direction: column;
    }

    &.canvas {
      background: var(--shade-900);
    }

    &.transparent {
      background: none;
    }

    &.card {
      border-radius: 0.5rem;
    }

    > .signer {
      display: flex;
      height: inherit;
      flex-direction: column;
      justify-content: center;
      flex-grow: 1;
      padding-top: 0.25rem;
    }

    > .submit {
      border-radius: inherit;
      height: inherit;
      display: flex;
      flex-grow: 1;
      max-width: 18rem;
      min-width: 18rem;

      @media (width < 650px) {
        max-width: 100%;
        height: 4.5rem;
        margin-top: 0.7rem;
      }
    }


    &.stacked {
      flex-direction: column;
      padding: 0 0.5rem;

      > .signer {
        padding: 1rem 0 0.25rem 0;
      }

      > .submit {
        max-width: 100%;
        margin-top: 0.7rem;
      }
    }
  }
`

export const SubmitButtonWrapper = styled.div`
  display: flex;
  border-radius: inherit;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  height: 100%;

  &.col {
    flex-direction: column;
    margin-top: 0.5rem;

    > div {
      width: 100%;
      margin-bottom: 0.4rem;

      > div,
      > p {
        width: 100%;
        margin-bottom: 0.4rem;
      }

      > div:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  > div {
    display: flex;
  } 
`

export const PromptWrapper = styled.div`
  margin-top: 0.5rem;

  p {
  color: var(--gray-900);
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  margin: 0.1rem 0;
  padding-left: 0.5rem;

  &.prompt {
    color: var(--gray-1000);
    align-items: flex-start;

    .icon {
      margin-top: 0.16rem;
      margin-right: 0.5rem;
    }
  }
}
`

export const SignerWrapper = styled.p`
  color: var(--gray-900);
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  margin: 0;
  margin-bottom: 0;

  &.badge-row {
    padding-bottom: 0.75rem;
  }

  .badge {
    border: 1px solid var(--gray-600);
    border-radius: 0.45rem;
    padding: 0.2rem 0.5rem;
    margin-right: 0.75rem;

    > svg {
      margin-right: 0.5rem;
    }
  }

  .not-enough {
    margin-left: 0.5rem;

    > .danger {
      color: var(--status-danger);
    }

    > .icon {
      margin-right: 0.3rem;
    }
  }
`

export const ProxySwitcher = styled.span`
  display: flex;
  align-items: center;
  margin-left: 0.75rem;
  gap: 0.4rem;

  button {
    background: var(--bg-primary);
    border-radius: 0.5rem;
    color: var(--gray-900);
    padding: 0.1rem 0.4rem;
    font-size: 0.85rem;
    transition: all 0.15s;

    &:hover {
      color: var(--gray-1000);
    }

    &:disabled {
      opacity: 0.4;
    }
  }
`
