<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Rules for AI agents working in this repository. These are not suggestions — code that
doesn't follow them gets rejected.

---

## 1. Project

This is Next-js App for power monitoring dashboard 

**Stack:** Next.js (App Router) · React · TypeScript strict ·
TanStack Query · Tailwind Css · npm

Do not add a dependency without asking. Say what you'd add and why.

## 2. Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
```

**Done means:** typecheck clean, lint clean, `build` succeeds (it catches server/client
boundary errors that `dev` hides), and you've told me what you did *not* verify.

## 3. Folder structure

```
src/
  app/                          # ROUTING ONLY
    (group)/
      <route>/
        page.tsx                # thin — compose feature components, nothing else
        loading.tsx
        error.tsx
      layout.tsx
    api/                        # route handlers; only when the browser can't call the backend directly
  features/
    <feature>/                  # a domain slice: devices, reports, auth, ...
      api/
        <feature>.types.ts      # request + response + domain types
        <feature>.service.ts    # HTTP calls
        <feature>.queries.ts    # TanStack Query hooks + query keys
      components/               # components owned by this feature
      hooks/                    # non-query hooks
      utils/
      index.ts                  # the feature's public surface
  components/
    ui/                         # primitives: button, input, dialog. Zero domain knowledge.
    layout/                     # shell: header, sidebar, nav
  lib/
    api-client.ts               # fetch wrapper: base URL, headers, error normalization
    query-client.ts
    utils.ts
  config/
    env.ts                      # validated env vars — nothing else reads process.env
  types/                        # cross-feature types only
```

**Rules:**

- A `page.tsx` contains layout and composition. Business logic, data shaping, and
  markup beyond a few elements belong in a feature component.
- Features do not import from each other's internals. Cross-feature imports go through
  `features/<other>/index.ts`, and if you find yourself needing that often, tell me —
  the boundary is probably wrong.
- `components/ui/` never imports from `features/`. The dependency runs one way.
- Anything used by exactly one feature lives inside that feature. Promote to shared
  only on the second consumer, not in anticipation of one.

## 4. The API layer — three files, always

Every endpoint gets three files. No exceptions, no shortcuts, even for one small call.

### `<feature>.types.ts` — shapes only

```ts
// No functions. No imports from the service or queries.
export interface Device {
  id: string;
  name: string;
  status: "online" | "offline";
}

export interface GetDevicesParams {
  page: number;
  pageSize: number;
  status?: Device["status"];
}

export interface GetDevicesResponse {
  data: Device[];
  total: number;
}
```

### `<feature>.service.ts` — HTTP only

```ts
import { apiClient } from "@/lib/api-client";
import type { GetDevicesParams, GetDevicesResponse, Device } from "./devices.types";

export async function getDevices(params: GetDevicesParams): Promise<GetDevicesResponse> {
  return apiClient.get("/devices", { params });
}

export async function getDevice(id: string): Promise<Device> {
  return apiClient.get(`/devices/${id}`);
}
```

- One exported function per endpoint, named after the operation.
- **No React, no hooks, no TanStack imports.** This file must be callable from a server
  component, a route handler, and a test.
- Throws on failure. Do not return `null` or `{ error }` — let the caller handle it.
- No transformation beyond what the API contract requires. Shaping for the UI happens
  in the hook's `select` or in the component.

### `<feature>.queries.ts` — TanStack only

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDevices, getDevice, updateDevice } from "./devices.service";
import type { GetDevicesParams } from "./devices.types";

export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (params: GetDevicesParams) => [...deviceKeys.lists(), params] as const,
  details: () => [...deviceKeys.all, "detail"] as const,
  detail: (id: string) => [...deviceKeys.details(), id] as const,
};

export function useDevices(params: GetDevicesParams) {
  return useQuery({
    queryKey: deviceKeys.list(params),
    queryFn: () => getDevices(params),
  });
}

export function useUpdateDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDevice,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: deviceKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
  });
}
```

- **Only this file imports `@tanstack/react-query`.** Never call `useQuery` in a component.
- Every feature has a key factory. Never write a query key as a bare inline array —
  that's how invalidation silently stops working.
- Every mutation declares what it invalidates.
- No `fetch` here. If you're writing a URL in this file, it belongs in the service.

### Who calls what

| Caller | Uses |
|---|---|
| Server component | the **service** directly (`await getDevices(...)`) |
| Client component | the **hook** (`useDevices(...)`) |
| Route handler | the **service** |
| Another hook | the **hook** |

A client component that imports the service directly is a bug.

### Checklist: adding an endpoint

1. Add request/response types to `<feature>.types.ts`.
2. Add the function to `<feature>.service.ts`.
3. Add the hook and key to `<feature>.queries.ts`.
4. Use the hook in the component. Handle loading, error, and empty.

## 5. Server vs client components

- Server by default. `"use client"` only for state, effects, event handlers, or browser APIs.
- Mark the **leaf**, not the page. If a page needs one interactive button, the button is
  the client component.
- Never import a service or server-side env into a client component.
- Fetch on the server where you can; use TanStack Query for anything that refetches,
  paginates, polls, or mutates.

## 6. Components

- One component per file. Filename `kebab-case.tsx`, component `PascalCase`.
- Props interface named `<Component>Props`, declared above the component.
- No default exports except `page.tsx`, `layout.tsx`, and other Next.js special files.
- A component either fetches data or renders it. Presentational components take props
  and stay free of query hooks, so they can be reused and tested.
- Every data-driven view handles **loading, error, and empty**. A missing empty state
  is an incomplete feature.

## 7. Types

- `strict: true`. No `any`. No `as` to silence the compiler — if a type is wrong, fix the
  type or ask me for the real payload shape.
- Derive rather than duplicate: `Pick`, `Omit`, `type X = Y["field"]`.
- `interface` for object shapes, `type` for unions and utilities.

## 8. Don'ts

- Don't upgrade Next.js, React, or TanStack Query unless I ask.
- Don't read `process.env` outside `config/env.ts`.
- Don't touch `.env*`, CI config, or generated files.
- Don't reformat files you aren't otherwise changing.
- Don't add comments that restate the code.
- Don't swallow errors with an empty catch.
- Don't create a new top-level directory without asking.
- Don't add plugin attribution or marker comments to generated code.

## 9. Project-specific traps
 
Mistakes that pass review and fail in production **in this codebase**. Fill this in as
you hit them — it's the one section an agent can't derive from reading the code.
 
Each entry: what goes wrong, then the concrete rule that avoids it. The examples below
are common Next.js ones — keep any that bite you here, delete the rest, and replace them
with your own as you find them.
 
- **Timestamps formatted during render cause hydration mismatches.** `toLocaleString()`
  runs in the server's timezone, then again in the browser's, and React blows up on the
  mismatch. Format dates in a client component, or pass a fixed `timeZone` explicitly.
- **A query key that omits a filter serves stale data.** If the response depends on it —
  page, page size, date range, status, sort — it goes in the key. A key of
  `["devices", "list"]` for a filtered list means switching filters shows the previous
  results until a refetch happens to land.
- **`NEXT_PUBLIC_*` values are frozen at build time.** Changing one in the deploy
  environment does nothing without a rebuild, and anything behind that prefix is
  readable by anyone who opens devtools. Secrets never take the prefix.
- **`fetch` in server components is cached by default.** A dashboard that should show
  live numbers will happily serve a response from an hour ago. Set `cache: "no-store"`
  or an explicit `revalidate` on every request that must be fresh.
- **`useSearchParams()` without a `<Suspense>` boundary breaks the build.** It forces the
  nearest boundary into client rendering; with none present, `build` fails even though
  `dev` was fine. Wrap the component that reads it.
- **Barrel files pull in more than you asked for.** Re-exporting everything from
  `features/<x>/index.ts` can drag server-only modules or heavy dependencies into a
  client bundle. Export only what other features actually consume.
- **`allowImportingTsExtensions` is load-bearing.** `node --test` resolves relative
  imports at runtime and needs an explicit `.ts` extension to find a sibling module;
  `tsc` under `moduleResolution: bundler` rejects that same extension unless this flag
  is set (valid only alongside `noEmit: true`, which this project already has). Only
  `*.test.ts` files (excluded from `tsc`'s `include`) need the extension — production
  files should stay extensionless so bundler resolution keeps working normally.
- **A `*.service.ts` reached by a `*.test.ts` file must not import `@/lib/api-client`
  (or anything else that reads `config/env.ts`).** `node --test` doesn't load
  `.env.local`, so `NEXT_PUBLIC_API_BASE_URL` is unset under a bare test run and
  `config/env.ts` throws at import time. Keep pure mapping/aggregation logic (the part
  worth unit-testing) in `utils/`, importing only types from `api/*.types.ts`, so tests
  never transitively touch the API client.

## 10. Working with me

- Ambiguous task? Ask **before** writing code.
- More than ~3 files? Outline the plan and wait for me to agree.
- Something here contradicts the code? Tell me — this file may be stale.
- Show me the diff, not a summary of it.
