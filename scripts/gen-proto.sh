#!/usr/bin/env bash
# Generates gRPC stubs for the Go and Python services from proto/*.proto.
#
# The Elysia/Bun gateway deliberately does NOT need this: it loads the .proto
# files directly at runtime via @grpc/proto-loader, so it has no codegen step
# at all. See gateway/src/grpc/*.ts.
#
# This script has not been run as part of scaffolding this project — nothing
# has been built. Run it yourself after installing the prerequisites below.
set -euo pipefail

cd "$(dirname "$0")/.."

# --- Go ---
# Prerequisites: protoc, and:
#   go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
#   go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
protoc \
  --go_out=inventory-service --go_opt=paths=source_relative \
  --go-grpc_out=inventory-service --go-grpc_opt=paths=source_relative \
  -I proto proto/inventory.proto

# --- Python ---
# Prerequisites: pip install grpcio-tools (declared in pricing-service/pyproject.toml)
python -m grpc_tools.protoc \
  -I proto \
  --python_out=pricing-service/pricing \
  --grpc_python_out=pricing-service/pricing \
  proto/pricing.proto

echo "Generated Go stubs under inventory-service/internal/pb/ and Python stubs under pricing-service/pricing/"
