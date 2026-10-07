import { Elysia } from "elysia";
import * as grpc from "@grpc/grpc-js";
import { getItem } from "./grpc/inventoryClient";
import { getPrice } from "./grpc/pricingClient";

const app = new Elysia()
  .get("/healthz", () => ({ status: "ok" }))
  .get("/products/:id", async ({ params, set }) => {
    // Fan out to both backend services concurrently — the whole point of the
    // gateway is that a caller never needs to know "product" is really two
    // services (Go for stock, Python for price) that don't know about each
    // other.
    const results = await Promise.allSettled([getItem(params.id), getPrice(params.id)]);
    const [itemResult, priceResult] = results;

    if (itemResult.status === "rejected") {
      return grpcErrorResponse(set, itemResult.reason, "inventory-service");
    }
    if (priceResult.status === "rejected") {
      return grpcErrorResponse(set, priceResult.reason, "pricing-service");
    }

    return {
      itemId: itemResult.value.itemId,
      name: itemResult.value.name,
      inStock: itemResult.value.stock > 0,
      stock: itemResult.value.stock,
      price: {
        amount: priceResult.value.amount,
        currency: priceResult.value.currency,
      },
    };
  })
  .listen(process.env.PORT ? Number(process.env.PORT) : 3000);

function grpcErrorResponse(set: { status?: number }, err: grpc.ServiceError, source: string) {
  if (err.code === grpc.status.NOT_FOUND) {
    set.status = 404;
    return { error: "not_found", source, message: err.details };
  }
  set.status = 502;
  return { error: "upstream_unavailable", source, message: err.details ?? err.message };
}

console.log(`gateway listening on http://localhost:${app.server?.port}`);
