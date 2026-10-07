"""PricingService implementation.

Depends on generated code (pricing_pb2, pricing_pb2_grpc) that does not exist
yet in this scaffold — see pricing/README.md.
"""
from __future__ import annotations

import grpc

from pricing import pricing_pb2, pricing_pb2_grpc

# A fixed, in-memory catalog mirroring the SKUs seeded in the Go
# inventory-service, so a gateway request against a real item ID gets a real
# price back end-to-end.
_CATALOG: dict[str, tuple[float, str]] = {
    "sku-1": (89.99, "USD"),
    "sku-2": (24.50, "USD"),
    "sku-3": (349.00, "USD"),
}


class PricingService(pricing_pb2_grpc.PricingServiceServicer):
    """Real, in-memory implementation of the generated servicer base class."""

    def GetPrice(
        self, request: pricing_pb2.GetPriceRequest, context: grpc.ServicerContext
    ) -> pricing_pb2.Price:
        entry = _CATALOG.get(request.item_id)
        if entry is None:
            context.abort(grpc.StatusCode.NOT_FOUND, f"item {request.item_id!r} not found")

        amount, currency = entry
        return pricing_pb2.Price(item_id=request.item_id, amount=amount, currency=currency)
