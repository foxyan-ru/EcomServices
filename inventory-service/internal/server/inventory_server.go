// Package server implements the InventoryService gRPC contract.
package server

import (
	"context"
	"sync"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	pb "polywire/inventory-service/internal/pb"
)

// InventoryServer is a real, in-memory implementation of
// pb.InventoryServiceServer — no database needed for the demo, but it's
// behind the generated interface so swapping in Postgres later doesn't touch
// any call sites.
type InventoryServer struct {
	pb.UnimplementedInventoryServiceServer

	mu    sync.RWMutex
	items map[string]*pb.Item
}

// NewInventoryServer seeds a small, fixed catalog so the gateway has
// something real to call end-to-end.
func NewInventoryServer() *InventoryServer {
	return &InventoryServer{
		items: map[string]*pb.Item{
			"sku-1": {ItemId: "sku-1", Name: "Mechanical Keyboard", Stock: 42},
			"sku-2": {ItemId: "sku-2", Name: "USB-C Hub", Stock: 0},
			"sku-3": {ItemId: "sku-3", Name: "Standing Desk", Stock: 7},
		},
	}
}

// GetItem returns the item for the given ID, or NOT_FOUND if it doesn't exist.
func (s *InventoryServer) GetItem(ctx context.Context, req *pb.GetItemRequest) (*pb.Item, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	item, ok := s.items[req.GetItemId()]
	if !ok {
		return nil, status.Errorf(codes.NotFound, "item %q not found", req.GetItemId())
	}
	return item, nil
}
