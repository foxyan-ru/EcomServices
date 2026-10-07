# PolyWire

A minimal three-service demo of a polyglot gRPC microservices setup:

- **gateway** — Elysia running on Bun, the only HTTP-facing service. Loads
  both `.proto` files at runtime via `@grpc/proto-loader` (no codegen step)
  and fans a single request out to both backends.
- **inventory-service** — Go, owns stock levels (`InventoryService.GetItem`).
- **pricing-service** — Python, owns prices (`PricingService.GetPrice`).

The point of the demo is the shape, not the domain: one HTTP endpoint
(`GET /products/:id`) backed by two independent gRPC services in two
different languages that don't know about each other, composed by a third.

## Architecture

```
        HTTP GET /products/:id
                 │
                 ▼
        ┌──────────────────┐
        │  gateway (Bun/    │
        │  Elysia)          │
        └───┬───────────┬───┘
            │ gRPC       │ gRPC
            ▼            ▼
  ┌──────────────────┐ ┌──────────────────┐
  │ inventory-service │ │ pricing-service   │
  │ (Go)              │ │ (Python)          │
  └──────────────────┘ └──────────────────┘
```

`gateway` calls both services concurrently with `Promise.allSettled` and
merges the results; a `NOT_FOUND` from either backend becomes an HTTP 404,
any other gRPC error becomes a 502 naming which upstream failed.

## Status

This is a fresh scaffold. **Nothing has been installed, generated, built, or
run.** Specifically:

- No `go mod tidy`, `go build`, or `go run` in `inventory-service/`.
- No `pip install` / `uv sync` in `pricing-service/`.
- No `bun install` in `gateway/`.
- No `protoc` codegen has been run — `inventory-service/internal/pb/` and
  `pricing-service/pricing/*_pb2*.py` don't exist yet (see the README in each
  of those folders).
- No `docker build` / `docker compose up`.

## Setup (commands you'd run, in order)

```bash
# 1. Generate Go + Python protobuf stubs (gateway needs no codegen step)
make proto

# 2. Go service
cd inventory-service && go mod tidy && go run ./cmd/server

# 3. Python service
cd pricing-service && uv sync && uv run python server.py
# (or: pip install -e . && python server.py)

# 4. Gateway
cd gateway && bun install && bun run dev
```

Or, once the proto stubs exist, bring all three up together:

```bash
make up   # docker compose up --build
```

Then:

```bash
curl localhost:3000/products/sku-1
curl localhost:3000/products/sku-2   # in stock=false, still prices fine
curl localhost:3000/products/nope    # 404 from inventory-service
```

## Why these three specific pieces

- **Bun + Elysia at the edge** — fast to iterate on, and `@grpc/proto-loader`
  means the gateway never needs a codegen step at all, which is a nice
  contrast against the two services that do.
- **Go for inventory** — gRPC's Go tooling (`protoc-gen-go`,
  `protoc-gen-go-grpc`) is the most mature of the three, and `grpc.NewServer`
  + generated `UnimplementedXServer` embedding is the idiomatic minimum-code
  way to implement a service.
- **Python for pricing** — shows the same contract implemented against
  `grpc_tools.protoc`-generated servicer base classes, using
  `ThreadPoolExecutor` per the standard grpcio server pattern.

## Extending this

Not built here, on purpose — this is deliberately minimal:

- No shared/central schema registry — both `.proto` files just live in
  `proto/` and each service's codegen step points at it directly. A larger
  version of this would use `buf` for linting/breaking-change detection and
  versioned publishing.
- No TLS, no auth between gateway and backends — everything is
  `grpc.credentials.createInsecure()` / plaintext, fine for a local demo,
  not for anything real.
- No service discovery — addresses are env vars, resolved by Docker Compose's
  DNS.
