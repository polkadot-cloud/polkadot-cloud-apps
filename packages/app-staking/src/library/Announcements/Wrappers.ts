// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SmallFontSizeMaxWidth } from 'consts'
import { motion } from 'motion/react'
import styled from 'styled-components'

export const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column wrap;
  width: 100%;
`

export const HeaderWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;

  @media (min-width: ${SmallFontSizeMaxWidth + 225}px) {
    margin-bottom: 1rem;
  }

  > div {
    border-right: 0;
    flex-basis: 100%;
    flex-grow: 1;
    margin-bottom: 0.5rem;

    &:last-child {
      border-right: 0;
    }

    @media (min-width: ${SmallFontSizeMaxWidth + 225}px) {
      border-right: 1px solid var(--gray-500);
      flex-basis: 20%;
      margin-bottom: 0;
      padding-left: 1rem;
      padding-right: 1rem;
      max-width: 275px;

      &:last-child {
        max-width: none;
      }
    }

    > .inner {
      border-bottom: 1px solid var(--gray-500);
      display: flex;
      flex-flow: column wrap;
      padding: 0.5rem 0.5rem 1rem 0.5rem;

      @media (min-width: ${SmallFontSizeMaxWidth + 225}px) {
        margin-bottom: 0;
      }

      h2 {
        color: var(--gray-1000);
        font-family: var(--font-family-mono);
        display: flex;
        align-items: center;

        > button {
          color: var(--gray-1000);
          margin-left: 0.75rem;
        }
      }

      h4 {
        color: var(--gray-900);
        font-family: var(--font-family-default);
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        margin-top: 0.45rem;
      }
    }

    &:first-child {
      padding-left: 0;
    }
    &:last-child {
      padding-right: 0;
    }
  }
`

export const AnnouncementsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;

  .category-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .category-header {
    font-family: var(--font-family-semibold);
    color: var(--gray-1000);
    font-size: 1.35rem;
    margin: 0.25rem 0 0;
    padding: 0 0.25rem;
  }

  .category-items {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;

    @media (min-width: ${SmallFontSizeMaxWidth + 225}px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
`

export const Item = styled(motion.div)`
  border: 1px solid var(--gray-500);
  border-radius: 0.75rem;
  list-style: none;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--background-secondary);
  transition: background var(--transition-duration);

  &:hover {
    background: var(--background-primary);
  }

  .value-node {
    margin-bottom: 0.75rem;
  }

  &.value-node-layout {
    > h4 {
      font-family: var(--font-family-semibold);
      margin-bottom: 0.75rem;
    }

    .value-node {
      margin-bottom: 0;
    }
  }

  > h2 {
    font-family: var(--font-family-mono);
    display: flex;
    align-items: center;
    margin: 0 0 0.75rem;
    color: var(--gray-1000);

    > svg {
      margin-right: 0.6rem;
    }

    > button {
      margin-left: 0.75rem;
      color: var(--gray-1000);
    }
  }

  > h3 {
    font-family: var(--font-family-mono);
    color: var(--gray-900);
    font-size: 1.2rem;
    margin: -0.2rem 0 0.75rem;
    font-weight: normal;
    line-height: 1.1;
  }

  > h4 {
    font-family: var(--font-family-default);
    color: var(--gray-900);
    margin: 0;
    font-weight: normal;
    display: flex;
    align-items: center;
    line-height: 1;
  }
`
