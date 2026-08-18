// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components'

type RetainmentStatus = 'success' | 'warning' | 'danger'

export const RetainmentSummaryWrapper = styled.section`
  background: var(--gray-200);
  border: 1px solid var(--gray-400);
  border-radius: 1.25rem;
  display: grid;
  gap: 0.75rem;
  margin: 0 0.9rem 1rem;
  padding: 1rem;
  width: calc(100% - 1.8rem);
`

export const RetainmentSummaryHeading = styled.h3`
  color: var(--gray-1000);
  font-family: var(--font-family-semibold);
  font-size: 1.3rem;
  margin: 0;
  padding: 0.1rem 0.15rem 0.25rem;
`

export const StatusBox = styled.div<{ $status: RetainmentStatus }>`
  align-items: center;
  background: ${({ $status }) =>
		`color-mix(in srgb, var(--status-${$status}) 8%, var(--gray-200))`};
  border: 1px solid
    ${({ $status }) =>
			`color-mix(in srgb, var(--status-${$status}) 16%, var(--gray-200))`};
  border-radius: 0.9rem;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  min-height: 4.5rem;
  padding: 0.85rem 1rem;
  width: 100%;
`

export const StatusCopy = styled.div<{ $status: RetainmentStatus }>`
  color: ${({ $status }) =>
		`color-mix(in srgb, var(--status-${$status}) 60%, var(--gray-1000))`};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;

  > strong,
  > span {
		color: inherit;
    font-family: var(--font-family-semibold);
		font-weight: 600;
  }

  > strong {
    font-size: 1.2rem;
  }

  > span {
    font-size: 1.1rem;
  }
`

export const StatusMessage = styled.div<{ $status: RetainmentStatus }>`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 0.85rem;
  min-width: 0;

  > svg {
    color: ${({ $status }) =>
			`color-mix(in srgb, var(--status-${$status}) 60%, var(--gray-1000))`};
    flex-shrink: 0;
    font-size: 1.75rem;
  }

  > .warningIcon {
    align-items: center;
    border: 2px solid currentcolor;
    border-radius: 50%;
    color: ${({ $status }) =>
			`color-mix(in srgb, var(--status-${$status}) 60%, var(--gray-1000))`};
    display: flex;
    flex: 0 0 1.65rem;
    font-size: 0.9rem;
    height: 1.65rem;
    justify-content: center;
    width: 1.65rem;
  }
`

export const WarningCopy = styled.div`
  align-items: center;
  color: color-mix(
    in srgb,
    var(--status-danger) 60%,
    var(--gray-1000)
  );
  display: flex;
  flex: 1;
  font-family: var(--font-family-semibold);
	font-size: 1.1rem;
  gap: 1rem;

  > svg {
    flex-shrink: 0;
		font-size: 1.75rem;
  }
`
