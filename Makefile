.PHONY: proto up down

proto:
	./scripts/gen-proto.sh

up:
	docker compose up --build

down:
	docker compose down -v
