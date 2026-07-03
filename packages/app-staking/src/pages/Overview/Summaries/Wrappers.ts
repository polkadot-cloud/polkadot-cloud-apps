// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { PageWidthMediumThreshold } from 'consts'
import styled from 'styled-components'

export const SectionNav = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
`

export const SectionsArea = styled.div<{
	$activeSection: number
	$totalSections: number
}>`
  display: flex;
  width: ${(props) => props.$totalSections * 100}%;
  overflow: hidden;
  flex: 1;
  
  .section {
    flex: 0 0 ${(props) => 100 / props.$totalSections}%;
    width: ${(props) => 100 / props.$totalSections}%;
    transition: transform 0.5s cubic-bezier(0.2, 1, 0.2, 1);
    transform: translateX(-${(props) => props.$activeSection * 100}%);
    display: flex;
    flex-direction: column;
  }
`

export const Subheading = styled.h4`
  color: var(--gray-900);
  padding: 0.45rem 0.4rem 0 0.4rem;
`

export const SectionWrapper = styled.div`  
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  
  .thin-scrollbar {
    .simplebar-track.simplebar-horizontal {
      height: 5px;
    }
    
    .simplebar-scrollbar:before {
      background: var(--gray-600);
      height: 5px;
      border-radius: 2px;
    }
  }
  
  .content {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;

    &.top {
      padding-top: 1rem;
      flex: 1;
    }
    
    &.vPadding {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }
     &.hPadding {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
    > h3 {
      margin-bottom: 0;
    }
  }

  .graph {
    padding: 0.1rem 1.5rem 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  > div {
    &:nth-child(2) {
      @media (max-width: 1400px) {
        margin-top: 1rem;
      }
    }

    > section {
      padding-left: 1.5rem;
      padding-bottom: 0.35rem;

      @media (max-width: ${PageWidthMediumThreshold}px) {
        padding-left: 1rem;
      }

      > div {
        padding-top: 0;
      }
    }
  }
`

export const SummaryHeading = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const FooterWrapper = styled.div`
  background: var(--btn-popover-tab-bg);
  display: flex;
  width: 100%;
  padding: 0.6rem 0;

  > div:first-child {
    display: flex;
     align-items: center;
     justify-content: flex-start;
     padding-left: 1rem;
     flex-grow: 1;
  }
`

export const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 3rem;

  &.border {
    border: 1px solid var(--gray-500);
    border-radius: 1rem;
    margin: 0 0.6rem;
  }

  > div {
    color: var(--text-tertiary);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem;
    gap: 0.5rem;
    flex-shrink: 0;

    &.inactive {
      opacity: 0.5;
    }

   > h4 {
      color: var(--text-tertiary);
      margin: 0;
    }

    > .icon {
      font-size: 1.25rem;
    }
  }

  > .icon {
    color: var(--text-tertiary);
    font-size: 1.5rem;
    opacity: 0.5;
  }
`
