import * as grpc from "@grpc/grpc-js";
import { loadClientConstructor } from "./loadProto";

export interface Item {
  itemId: string;
  name: string;
  stock: number;
}

const InventoryServiceClient = loadClientConstructor(
  "inventory.proto",
  "inventory",
  "InventoryService",
);

const addr = process.env.INVENTORY_GRPC_ADDR ?? "localhost:50051";
const client = new InventoryServiceClient(addr, grpc.credentials.createInsecure());

/** Calls the Go inventory-service. Rejects with the raw grpc.ServiceError on failure. */
export function getItem(itemId: string): Promise<Item> {
  return new Promise((resolve, reject) => {
    client.GetItem({ itemId }, (err: grpc.ServiceError | null, response: Item) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}
