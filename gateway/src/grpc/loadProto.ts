import path from "node:path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

/**
 * Loads a .proto file at runtime and returns a constructable gRPC client
 * class for it. This is the whole reason the gateway needs no codegen step,
 * unlike the Go and Python services: @grpc/proto-loader builds the message
 * (de)serializers dynamically from the .proto's own descriptors.
 */
export function loadClientConstructor(
  protoRelativePath: string,
  packageName: string,
  serviceName: string,
): grpc.ServiceClientConstructor {
  const protoPath = path.join(import.meta.dir, "../../../proto", protoRelativePath);

  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: false, // camelCase field names in JS, e.g. itemId instead of item_id
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const loaded = grpc.loadPackageDefinition(packageDefinition) as any;
  const serviceDefinition = loaded[packageName]?.[serviceName];
  if (!serviceDefinition) {
    throw new Error(`could not find ${packageName}.${serviceName} in ${protoRelativePath}`);
  }
  return serviceDefinition as grpc.ServiceClientConstructor;
}
