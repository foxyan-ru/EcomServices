import * as grpc from "@grpc/grpc-js";
import { loadClientConstructor } from "./loadProto";

export interface Price {
  itemId: string;
  amount: number;
  currency: string;
}

const PricingServiceClient = loadClientConstructor(
  "pricing.proto",
  "pricing",
  "PricingService",
);

const addr = process.env.PRICING_GRPC_ADDR ?? "localhost:50052";
const client = new PricingServiceClient(addr, grpc.credentials.createInsecure());

/** Calls the Python pricing-service. Rejects with the raw grpc.ServiceError on failure. */
export function getPrice(itemId: string): Promise<Price> {
  return new Promise((resolve, reject) => {
    client.GetPrice({ itemId }, (err: grpc.ServiceError | null, response: Price) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}
