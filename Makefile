.PHONY: help install install-backend install-frontend dev dev-backend dev-frontend \
        test test-backend seed build docker-up docker-down fmt clean

help:                 ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: install-backend install-frontend  ## Install all dependencies

install-backend:      ## Install Python dependencies
	cd backend && pip install -r requirements.txt

install-frontend:     ## Install npm dependencies
	cd frontend && npm install

dev:                  ## Run backend + frontend dev servers (needs `make -j2 dev`)
	@echo "Use: make -j2 dev-backend dev-frontend"

dev-backend:          ## Start FastAPI with reload
	cd backend && uvicorn app.main:app --reload

dev-frontend:         ## Start Vite dev server
	cd frontend && npm run dev

test: test-backend    ## Run all tests

test-backend:         ## Run backend pytest suite
	cd backend && pytest

seed:                 ## Populate the demo user + sample data
	cd backend && python scripts/seed.py

build:                ## Build the frontend for production
	cd frontend && npm run build

docker-up:            ## Start everything via docker-compose
	docker-compose up --build

docker-down:          ## Tear down docker-compose stack
	docker-compose down -v

fmt:                  ## Run pre-commit formatters on all files
	pre-commit run --all-files || true

clean:                ## Remove build artifacts & caches
	rm -rf frontend/dist frontend/node_modules
	find backend -type d -name __pycache__ -exec rm -rf {} +
	rm -f backend/*.db backend/test_aisc.db
