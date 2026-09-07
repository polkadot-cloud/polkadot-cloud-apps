# data-gate

Shared data routing and request state for any `app-*` package. Apps choose modules; a resource starts work only when subscribed to or explicitly requested. Importing the package or mounting the provider alone starts no fetches.

The package owns **source selection, prerequisites, deduplication, caching, refresh, cancellation, and errors**. `plugin-staking-api` supplies GraphQL documents and transport; the injected `ServiceInterface` supplies node queries. Neither source imports an app. React adapters are optional; the runtime works without React.

## Use only the modules an app needs

```tsx
import { DataGateProvider, useTokenPrice } from 'data-gate/react'

function Price() {
  const { data, loading, error, refresh } = useTokenPrice('DOT')
  if (loading) return <span>Loading…</span>
  if (error) return <button onClick={() => void refresh()}>Retry</button>
  return <span>{data?.price ?? '—'}</span>
}

<DataGateProvider network="polkadot" apiEnabled modules={['prices']}>
  <Price />
</DataGateProvider>
```

Prices need no node service or era. Available modules are `staking`, `validators`, `pools`, `identities`, `prices`, and `rewards`. Enabling one grants access to its resources; it does not eagerly sync every resource. Related modules remain explicit: a pool nomination-status view uses `pools` and `staking`; validator identities use `validators` and `identities`.

Existing apps use `hooks/useDataGate`'s `AppDataGate` to supply network, plugin preference, era, node readiness, SS58, token units, and eras per day. That integration also forwards reconnect/transaction invalidation and publishes pool warnings for existing bus consumers. Its account and global-store dependencies are outside this package. New apps can use `DataGateProvider` directly. Supply chain-specific `ss58`, `units`, and `erasPerDay` for staking resources (defaults are Polkadot's 0, 10, and 1).

## One routing table

[`src/policy.ts`](src/policy.ts) is the support matrix and resource-to-source table. An omitted module always resolves its resources to `disabled`.

| Resource | Polkadot API enabled | Kusama API enabled | API disabled / Paseo |
| --- | --- | --- | --- |
| Nomination statuses, active nominator count | API | API | Node |
| Nomination backing amounts | Node, selected validators | Node, selected validators | Node, selected validators |
| Validator APY, identities | API | API | Node |
| Retainment, paginated validator directory | API | Disabled | Disabled |
| Optimal validator selection | API | Node + API sanitation | Node |
| Validator entries and overview metadata | Node | Node | Node |
| Pool directory and nominations | Node | Node | Node |
| Pool candidate IDs | API | API | Node |
| Pool member IDs / details | API / node | API / node | Disabled / node |
| Pool warnings | API | Disabled | Disabled |
| Rewards, historical charts, prices | API | API | Disabled |

Retainment support is separate from general API support. Kusama's APY and nomination status do not wait for node exposure syncing just because retainment is unavailable.

Node prerequisites apply only to resources routed to the node. Era-dependent resources explicitly declare `requires: ['era']`; prices and directory/history queries with explicit inputs can start before an era is known.

Most API failures stay errors. They never silently start a full exposure scan. `averageRewardInputs` explicitly permits a bounded historical-payout fallback for an unavailable/nonpositive API average rate; the fallback appears as a separate dependency in diagnostics.

## Resources and lifecycle

```ts
import { createDataGate } from 'data-gate'
import { nominationStatuses } from 'data-gate/resources/nominations'

const gate = createDataGate({
  network: 'polkadot', apiEnabled: true, modules: ['staking'], era: 100,
})
const statuses = await gate.request(nominationStatuses(stash, targets))
// gate.request throws on failure. It never substitutes an empty successful result.
gate.dispose()
```

React consumers can use domain hooks or `useDataResource(resourceFactory(...))`. Resources expose `idle`, `blocked`, `loading`, `ready`, `error`, and `disabled`, plus `data`, `error`, `source`, `updatedAt`, and `refresh`. React adds `loading` for the first load and `refreshing` for background work. Valid empty results are `ready`; missing data is not a staking status. A timeout (30 seconds by default) becomes an error, never “synced.”

The immutable gate scope includes network, API preference, era, node service/readiness, modules, and chain parameters. Resource keys include their arguments, such as account, sorted targets, and pagination. Changing provider scope replaces and disposes the old gate. Late results cannot update the new scope. Node transports may finish already-started RPCs after cancellation; aborted consumers ignore those results and do not start subsequent dependencies.

Identical requests share in-flight work and settled data. `staleTimeMs` controls reuse when a resource is requested again. Prices and API nomination statuses refresh every 30 seconds while subscribed; validator stats refresh every minute. API status refresh accommodates indexer catch-up after an era change. Node status/backing reuse era-scoped exposure data. Unsubscribing stops periodic refresh; disposing the gate cancels pending work. The provider supports React StrictMode effect replay.

Use `gate.invalidate([resourceName, ...])` after external changes and `refresh()` to retry a resource. `gate.request(definition, { refresh: true })` requests a fresh candidate selection while still deduplicating concurrent requests. Account-specific data is keyed by account; it is not held in one global account cache.

`useDataDiagnostics()` or `gate.getDiagnostics()` reports resource names, keys, source, prerequisites, state, timing, and errors. `useDataSync()` observes initial work from actual resources instead of relying on the legacy global sync timeout. Background refreshes keep existing data visible. Diagnostic keys may contain account addresses; treat exported diagnostics accordingly.

## Maintaining the package

- `policy.ts`: network support, module capabilities, source decisions.
- `resources/`: small domain factories and explicit dependencies.
- `sources/`: strict API transport and node helpers.
- `runtime/`: source-independent lifecycle and cache.
- `react/`: provider, resource hooks, and compatibility view adapters.
- `tests/`: policy, lifecycle, source isolation, status/backing timing, and rendering regressions.

Add a resource name to the policy, implement its factory in the appropriate domain file, and test the API/node/disabled behavior. Keep account selection, navigation, translation, and transaction signing in the consuming app. Compatibility history hooks accept `network` for existing callers; the provider's network is authoritative.

The existing staking/nominate/validator providers still request the node validator directory and overview metadata for local lists, filters, and summaries. The pool-enabled app still requests its node pool directory. Those requests are now visible through the gate. Full exposure pages are no longer an eager era-provider prerequisite: they are requested for selected backing amounts, node nomination statuses, or the explicitly requested node-wide nominator count. Wallet connections, balances, ledgers, transaction submission, and live chain subscriptions remain in their existing service layer.

Run `pnpm --filter data-gate test` and `pnpm --filter data-gate check`.
