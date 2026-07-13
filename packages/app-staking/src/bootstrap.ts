// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Buffer } from 'buffer'

Object.assign(globalThis, { Buffer })

void import('./main')
