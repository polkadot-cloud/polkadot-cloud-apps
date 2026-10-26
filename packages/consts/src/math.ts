// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Largest balance representable by the runtime's unsigned 128-bit amount type.
export const U128_MAX = (1n << 128n) - 1n

// Integer denominators for parts per million, parts per billion, and basis points.
export const PERMILL = 1_000_000n
export const PERBILL = 1_000_000_000n
export const BASIS_POINTS = 10_000n
