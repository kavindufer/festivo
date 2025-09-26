SHELL := /bin/bash
INFRA := infra

.PHONY: up down logs rebuild reset seed fmt lint test be fe

up:
cd $(INFRA) && docker compose up -d --build

down:
cd $(INFRA) && docker compose down

logs:
cd $(INFRA) && docker compose logs -f --tail=200

rebuild:
cd $(INFRA) && docker compose build --no-cache

reset:
cd $(INFRA) && docker compose down -v

seed:
@echo "Seeding via MySQL init script (on container start). Restart DB to re-run."
cd $(INFRA) && docker compose restart db

fmt:
cd backend && ./mvnw -q spotless:apply || true
cd frontend && npx prettier --write .

lint:
cd frontend && npm run lint || true

test: be
cd frontend && npm test || true

be:
cd backend && ./mvnw -q -DskipTests=false verify

fe:
cd frontend && npm ci && npm run build
