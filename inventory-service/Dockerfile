# Not built as part of scaffolding this project.
FROM golang:1.24 AS build
WORKDIR /src
COPY . .
RUN go mod tidy && go build -o /out/inventory-service ./cmd/server

FROM gcr.io/distroless/base-debian12
COPY --from=build /out/inventory-service /inventory-service
EXPOSE 50051
ENTRYPOINT ["/inventory-service"]
