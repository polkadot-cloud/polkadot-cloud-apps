// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// The threshold above minimum to earn rewrads for a nominate recommendation. Acts as a buffer above
// the minimum and helps prevent situations where the bonded amount drops below the minimum required
// to earn rewards in volatile network conditions.
export const NominateBuffer: bigint = 150n // 150%
