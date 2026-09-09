# data-gate

One source-neutral hook for a nominator or pool stash's overall nomination status:

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
Changed values select a fresh query; equal values share cached results even if
objects are recreated. Include inputs such as subscribed nominations that can
change within an era. The hook still works with just a stash address.

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
Cached results have no age-based expiry, and requests do not poll or automatically retry.
Mounting the provider alone fetches nothing.

Each data point declares its options with `dataPointOptions` in `src/query.ts`.
The shared `DataPointConfig<T>` in `src/types.ts` gives both sources the same
result type and a small configuration API:

| Field | Purpose |
| --- | --- |
| `key` | Data point name and inputs, before data gate adds network and source. |
| `node.queryFn`, `stakingApi.queryFn` | Fetch with `{ network, signal }`, or use `skipToken` for missing input. |
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

Run `pnpm --filter data-gate check` and
`pnpm --filter tests test -- src/dataGate.test.ts`.
