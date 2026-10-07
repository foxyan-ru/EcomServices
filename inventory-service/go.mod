module polywire/inventory-service

go 1.24

// Dependencies declared by hand; `go mod tidy` has not been run and there is
// no go.sum yet. Run `go mod tidy` after generating the protobuf stubs
// (../scripts/gen-proto.sh), since the generated code imports
// google.golang.org/protobuf directly.
require (
	google.golang.org/grpc v1.68.1
	google.golang.org/protobuf v1.35.2
)
