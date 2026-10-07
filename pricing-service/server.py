"""Entry point for the PricingService gRPC server."""
from __future__ import annotations

import os
from concurrent import futures

import grpc

from pricing import pricing_pb2_grpc
from pricing.service import PricingService


def serve() -> None:
    addr = os.environ.get("PRICING_GRPC_ADDR", "[::]:50052")

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pricing_pb2_grpc.add_PricingServiceServicer_to_server(PricingService(), server)
    server.add_insecure_port(addr)

    print(f"pricing-service listening on {addr}")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
