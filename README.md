# Ayurvedic Super App

A production-ready React Native super app with three independent modules: **Consultation**, **Shop**, and **Health Records**. Built with TypeScript, Expo SDK 57, and a focus on architecture, scalability, offline-first behavior, and developer experience.

## Quick Start

```bash
npm install
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npm test           # Run test suite
npm run typecheck  # TypeScript validation
```

## Folder Structure

```
src/
├── app/                    # App shell: providers, root navigation
│   ├── navigation/
│   └── providers/
├── core/                   # Shared infrastructure
│   ├── api/                # HTTP client, mock handler injection
│   ├── config/             # Environment configuration
│   ├── errors/             # Error types, Error Boundary
│   ├── feature-flags/      # Runtime feature toggles
│   ├── i18n/               # Localization (en, hi)
│   ├── logging/            # Structured logger
│   ├── monitoring/         # Performance + crash reporting abstractions
│   ├── network/            # Connectivity provider
│   ├── storage/            # AsyncStorage + SecureStore wrappers
│   ├── sync/               # Offline queue + sync manager
│   ├── theme/              # Design tokens, dark mode
│   └── toast/              # Global toast system
├── features/               # Independent feature modules
│   ├── consultation/       # Doctor booking module
│   ├── shop/               # E-commerce module
│   ├── health-records/     # Patient timeline module
│   └── settings/           # Theme & language settings
├── mocks/                  # Procedural data generators + mock API
│   ├── generators/         # 5k doctors, 20k products, 10k records
│   └── mockApi.ts          # Simulated backend with failure modes
└── shared/                 # Cross-feature utilities
    ├── components/ui/      # Design system primitives
    ├── hooks/
    ├── types/
    └── utils/
```

Each feature module is self-contained with its own `api/`, `hooks/`, `navigation/`, `screens/`, `store/`, and `types/`.

## Architectural Decisions

### Modular Feature Architecture
Modules are isolated behind their own navigators, APIs, and stores. They communicate only through shared `core/` and `shared/` layers — never directly with each other. This allows teams to own modules independently.

### State Management: Zustand + TanStack Query
| Layer | Tool | Purpose |
|-------|------|---------|
| Server state | TanStack Query | API data, caching, pagination, offline persistence |
| Client state | Zustand | Cart, wishlist, pending bookings, UI preferences |
| Persistence | AsyncStorage | Query cache, cart, wishlist, offline queue |

**Why this split?** TanStack Query excels at async server state with built-in stale-while-revalidate, retry, and cache invalidation. Zustand handles synchronous client state with minimal boilerplate and native persist middleware.

### API Abstraction Layer
`src/core/api/client.ts` provides a single entry point for all HTTP calls with:
- Configurable timeouts
- Session expiration handling
- Mock/real backend switching via `EXPO_PUBLIC_APP_ENV`
- Performance timing
- Structured error types (`AppError`, `ConflictError`, `TimeoutError`, etc.)

### Procedural Mock Data
Instead of loading 20,000 JSON objects into memory, data is **generated on-demand** from index using deterministic seeded random functions. This means:
- O(1) memory per item
- Instant app startup
- Consistent data across sessions
- Full dataset support without bundle bloat

## Performance Optimizations

| Technique | Where Applied |
|-----------|---------------|
| **FlashList virtualization** | Doctor list, product list, health records, cart |
| **React.memo** | List item cards (DoctorCard, ProductCard, RecordCard) |
| **useCallback / useMemo** | List renderers, filter computations, debounced search |
| **Infinite pagination** | All list screens (20-30 items per page) |
| **Debounced search** | 300ms debounce on all search inputs |
| **Query staleTime** | 5min for lists, reducing unnecessary refetches |
| **Lazy data generation** | Procedural generators — no upfront data loading |
| **Selective query persistence** | Only successful queries dehydrated to storage |

## Offline Strategy

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  UI Layer   │────▶│ TanStack     │────▶│ AsyncStorage│
│             │     │ Query Cache  │     │ (persisted) │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐     ┌──────────────┐
│ Zustand     │     │ Offline Queue│
│ Cart/Wishlist│    │ (bookings)   │
└─────────────┘     └──────────────┘
                           │
                    NetInfo listener
                           │
                           ▼
                    Sync Manager ──▶ Mock API
```

- **Cached API responses**: TanStack Query with AsyncStorage persister (`networkMode: 'offlineFirst'`)
- **Offline cart**: Zustand persist middleware — cart survives app restarts
- **Offline bookings**: Queued in `offlineQueue`, synced via `syncManager` when connectivity returns
- **Network banner**: Visual indicator when offline

## Reliability

The mock API simulates production failure modes:
- Random 5% failure rate (configurable)
- Slow network (10% of requests get 3x delay)
- Timeout handling via AbortController
- Empty/invalid JSON responses
- Session expiration (401)
- Slot conflicts and double-booking prevention
- Expired slot validation

## Bonus Features Implemented

1. **Feature Flags** — Runtime toggles for wishlist, video consultation, checkout variant
2. **Localization** — English and Hindi via i18next
3. **Deep Linking** — `ayurvedic://consult/doctor/doc-0`, `ayurvedic://shop/cart`, etc.
4. **Secure Local Storage** — expo-secure-store wrapper for auth tokens
5. **Performance Monitoring** — Timer abstraction for API call metrics
6. **Crash Reporting** — Pluggable abstraction (console implementation included)

## Testing

```bash
npm test
```

| Test File | Coverage |
|-----------|----------|
| `seededRandom.test.ts` | Utility functions |
| `generators.test.ts` | Mock data business logic |
| `cartStore.test.ts` | Cart state management |
| `useDebounce.test.ts` | Custom hook |
| `featureFlags.test.ts` | Feature flag system |
| `consultationBooking.e2e.test.ts` | Full booking flow E2E |

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Procedural data vs. pre-built dataset | Faster startup and lower memory, but search requires O(n) index scan (mitigated by pagination) |
| Mock API vs. real backend | Full offline/reliability demo without external dependencies |
| Expo vs. bare RN CLI | Faster DX with Expo SDK 57; can eject/prebuild for native modules |
| FlashList vs. FlatList | Better performance but requires `estimatedItemSize` tuning |
| Zustand over Redux | Less boilerplate, but fewer devtools for complex state graphs |

## Future Improvements

- [ ] Replace mock API with real backend (API client is ready)
- [ ] Add Detox/Maestro for device-level E2E tests
- [ ] Implement `@shopify/flash-list` recycling for image-heavy lists
- [ ] Add React Query prefetching on tab focus
- [ ] WebSocket for real-time slot availability
- [ ] MMKV for faster storage (replace AsyncStorage)
- [ ] Sentry/Firebase crash reporting integration
- [ ] Push notifications for appointment reminders
- [ ] Biometric authentication for health records access

## Environment Variables

| Variable | Values | Default |
|----------|--------|---------|
| `EXPO_PUBLIC_APP_ENV` | `development`, `staging`, `production` | `development` |

## Deep Link Examples

```
ayurvedic://consult
ayurvedic://consult/doctor/doc-42
ayurvedic://consult/bookings
ayurvedic://shop
ayurvedic://shop/product/prod-100
ayurvedic://shop/cart
ayurvedic://records
ayurvedic://records/rec-50
ayurvedic://settings
```
