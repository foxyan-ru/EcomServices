// Command server runs the InventoryService gRPC server.
package main

import (
	"log"
	"net"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	pb "polywire/inventory-service/internal/pb"
	"polywire/inventory-service/internal/server"
)

func main() {
	addr := os.Getenv("INVENTORY_GRPC_ADDR")
	if addr == "" {
		addr = ":50051"
	}

	lis, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatalf("failed to listen on %s: %v", addr, err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterInventoryServiceServer(grpcServer, server.NewInventoryServer())
	reflection.Register(grpcServer) // enables `grpcurl` against this service without a copy of the .proto

	log.Printf("inventory-service listening on %s", addr)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("grpc server failed: %v", err)
	}
}
