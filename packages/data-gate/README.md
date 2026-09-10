# data-gate

`data-gate` is a general-purpose data flow tool for exposing data from different
sources through a consistent hook API. Data points define how each source fetches
or subscribes to data; the shared infrastructure handles source selection,
request sharing, caching, and cancellation.

Nomination status is the first use case. `useNominationStatus` returns a nominator
or pool stash's overall nomination status through one source-neutral hook:

```tsx
import { useNominationStatus } from 'data-gate'

const { status, loading, error, refetch } = useNominationStatus(stash, {
  dependencies: [nominations],
})
```

`status` is `active`, `inactive`, or `waiting` once resolved. It is `undefined`
while loading, after an initial error, or without an address. `waiting` is a
staking status, not a loading state.

The optional `dependencies` array adds serializable values to the query key.
Changed values select a different cache key, fetching if no fresh result exists;
equal values share cached results even if objects are recreated. Include inputs
such as subscribed nominations that can change within an era. The hook still
works with just a stash address.

Call `refetch()` to explicitly refresh the current query or retry an error once
its address and source prerequisites are available. It returns TanStack Query's
result promise. Dependency changes need no refetch effect: query keys handle
request sharing, cancellation, and isolation from late results.

The provider reads the service API, readiness, active era, network, and plugin
selection from `global-bus` and subscribes to changes. No configuration props are
needed:

```tsx
import { DataGateProvider } from 'data-gate'

<DataGateProvider>{children}</DataGateProvider>
```

- **Staking API:** one request, without waiting for node readiness, validator
  entries, or exposure syncing. Failures remain errors; they never trigger a
  node fallback.
- **Node:** wait for connection readiness and an active era, fetch the stash's
  nominees, then read overviews and all exposure pages for those targets only.
  No global validator or nominator scan is required.

TanStack Query handles shared requests, caching, and cancellation.
Results are keyed by network, source, era, address, and optional dependencies.
Fetch results have no age-based expiry, and requests do not poll or automatically retry.
Mounting the provider alone fetches nothing.

Each data point declares its options with `dataPointOptions` in `src/query.ts`.
The shared `DataPointConfig<T>` in `src/types.ts` gives both sources the same
result type and a small configuration API:

| Field | Purpose |
| --- | --- |
| `key` | Data point name and inputs, before data gate adds network and source. |
| Source `queryFn` | Fetch with `{ network, signal }`, or use `skipToken` for missing input. |
| Source `subscribe` | Subscribe with `{ network, signal, next, error }`; return an unsubscribe function or a promise of one. May also use `skipToken`. |
| Source `enabled` | Optional readiness condition; defaults to `true`. |

The helper adds network/source cache scoping and runs only the selected source.
The data point's hook calls `useDataGate()` to receive service inputs and react
to global source changes, then passes its options to TanStack's `useQuery`.
Use-case settings stay in the data point's declaration.

`src/nominationStatus/index.ts` is the first implementation. Its `nodeSource` and
`stakingApiSource` helpers each return `DataPointSource<T>` and define the source's
prerequisites and query function before combining them with the cache key.
Its `types.ts` defines the node query contract; `node.ts` provides the node fetch,
and the API fetch is imported directly from `plugin-staking-api`.

For example, a one-shot query in `src/balance/index.ts` can use `queryFn` for
both sources. The illustrative `fetchNodeBalance` and `fetchApiBalance` helpers
below return promises of the same balance type and respect the abort signal:

```tsx
import { useQuery } from '@tanstack/react-query'
import { useDataGate } from '../provider'
import { dataPointOptions } from '../query'
import { fetchApiBalance, fetchNodeBalance } from './sources'

export const useBalance = (address: string) => {
  const { node, ready } = useDataGate()

  return useQuery(dataPointOptions({
    key: ['balance', address],
    node: {
      enabled: ready,
      queryFn: ({ signal }) => fetchNodeBalance(node, address, signal),
    },
    stakingApi: {
      queryFn: ({ network, signal }) => fetchApiBalance(network, address, signal),
    },
  }))
}
```

The configuration always has `node` and `stakingApi` fields. Each source chooses
**either** `queryFn` or `subscribe` independently. If both underlying sources
support subscriptions, the same hook can instead be implemented as follows.
These illustrative helpers emit the same balance type through `next(balance)`,
report failures through `error(reason)`, respect the abort signal, and return an
unsubscribe function (or a promise of one):

```tsx
import { useQuery } from '@tanstack/react-query'
import { useDataGate } from '../provider'
import { dataPointOptions } from '../query'
import { subscribeApiBalance, subscribeNodeBalance } from './sources'

export const useBalance = (address: string) => {
  const { node, ready } = useDataGate()

  return useQuery(dataPointOptions({
    key: ['balance', address],
    node: {
      enabled: ready,
      subscribe: ({ signal, next, error }) =>
        subscribeNodeBalance(node, address, { signal, next, error }),
    },
    stakingApi: {
      subscribe: ({ network, signal, next, error }) =>
        subscribeApiBalance(network, address, { signal, next, error }),
    },
  }))
}
```

Only the selected source runs: `stakingApi` when its plugin is enabled, otherwise
`node`. All four combinations are supported:

| Node source | Staking API source |
| --- | --- |
| `queryFn` (one-shot) | `queryFn` (one-shot) |
| `subscribe` (live) | `subscribe` (live) |
| `subscribe` (live) | `queryFn` (one-shot) |
| `queryFn` (one-shot) | `subscribe` (live) |

For a live node and one-shot API, combine `node.subscribe` from the second example
with `stakingApi.queryFn` from the first. For the reverse, combine `node.queryFn`
from the first with `stakingApi.subscribe` from the second. Both sources must
produce the same result type; each source supplies only one of the two methods.

All combinations expose the same consumer API under `DataGateProvider`:

```tsx
const { data, isPending, error, refetch } = useBalance(address)
```

Subscription emissions need no `dependencies` array or refetch effect. Include
inputs that change what is subscribed to in the key (such as `address` above).
Changing those inputs switches to the new key's subscription, starting one if
needed; the old subscription stops when its last consumer leaves.

Subscription sources share one subscription per client and query key. The first
emission resolves the query; later emissions replace its cached value without
another fetch. Errors stop the subscription and surface through `error`, retaining
any previous value. Call `refetch()` to restart and await the first new value;
while the initial request is pending, refetch shares that request.

Changing keys, switching sources, losing readiness, removing the query, or losing
the last consumer aborts the subscription and runs its cleanup. Cleanup that
arrives asynchronously still runs after cancellation. Remounting reconnects a
cached subscription. Imperative `fetchQuery` calls without mounted consumers
return one snapshot and unsubscribe.

The existing nomination-status sources remain fetches; subscription support is
opt-in for data points whose underlying source emits live results.

Run `pnpm --filter data-gate check` and
`pnpm --filter tests test -- src/dataGate.test.ts`.
