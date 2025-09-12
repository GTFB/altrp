# Use POSIX shell for portability
SHELL := /bin/sh

.PHONY: help init install dev build lint format prepare tailwind shadcn hygen test clean branch commit component kill-node env

help:
	@echo "Available targets:"
	@echo "  init      - Initialize project configs (ESLint, Prettier, Husky, Tailwind scaffold)"
	@echo "  install   - Install dependencies using Bun"
	@echo "  dev       - Run Next.js dev server"
	@echo "  build     - Build Next.js app"
	@echo "  lint      - Run ESLint"
	@echo "  format    - Run Prettier"
	@echo "  prepare   - Setup Husky"
	@echo "  tailwind  - Generate Tailwind config and globals.css directives"
	@echo "  shadcn    - Initialize shadcn/ui"
	@echo "  hygen     - Initialize Hygen scaffolding (_templates)"
	@echo "  component - Generate component: make component NAME=ComponentName"
	@echo "  env       - Generate .env file from example.env with auto-generated NEXTAUTH_SECRET"
	@echo "  test      - Run unit tests with Bun"
	@echo "  kill-node - Kill all Node.js processes"
	@echo "  branch    - Create/switch branch: make branch BR=name"
	@echo "  commit    - Git add & commit: make commit MSG=\"message\""

install:
	bun install

dev:
	bun run dev:site

build:
	bun run build

lint:
	bun run lint

format:
	bun run format

prepare:
	bun run prepare

# Generate Tailwind configs if missing
TAILWIND_CONFIG := tailwind.config.ts
GLOBAL_CSS := src/app/globals.css

tailwind:
	@[ -f $(TAILWIND_CONFIG) ] || bunx tailwindcss init -p --ts
	@mkdir -p src/app
	@[ -f $(GLOBAL_CSS) ] || printf "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n" > $(GLOBAL_CSS)

shadcn:
	bunx --yes shadcn@latest init -y

hygen:
	@[ -d _templates ] || mkdir -p _templates
	@[ -d _templates/component/new ] || mkdir -p _templates/component/new

component: hygen
	@test -n "$(NAME)" || (echo "NAME is required, e.g., make component NAME=Header" && exit 1)
	bun hygen component new --name $(NAME)

# One-shot initializer for configs only (does not run create-next-app)
init: install prepare tailwind shadcn hygen

# Git helpers
BR ?=
MSG ?=

branch:
	@test -n "$(BR)" || (echo "BR is required, e.g., make branch BR=feature/x" && exit 1)
	git switch -c $(BR) || git switch $(BR)

commit:
	@test -n "$(MSG)" || (echo "MSG is required, e.g., make commit MSG=\"chore: message\"" && exit 1)
	git add .
	git commit -m "$(MSG)"

# Run tests
test:
	bun test

# Kill all Node.js processes
kill-node:
	taskkill /F /IM node.exe

# Generate .env file from example.env with auto-generated NEXTAUTH_SECRET
env:
	@echo "Generating .env file from example.env..."
	@if [ -f apps/site/.env ]; then \
		echo "Warning: .env file already exists. Backing up to .env.backup"; \
		cp apps/site/.env apps/site/.env.backup; \
	fi
	@cp apps/site/example.env apps/site/.env
	@echo "Generating NEXTAUTH_SECRET..."
	@if command -v openssl >/dev/null 2>&1; then \
		SECRET=$$(openssl rand -base64 32); \
		sed -i.bak "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$$SECRET/" apps/site/.env; \
		rm apps/site/.env.bak; \
		echo "NEXTAUTH_SECRET generated and added to .env"; \
	else \
		echo "Warning: openssl not found. Please manually set NEXTAUTH_SECRET in .env"; \
		echo "You can generate one at: https://generate-secret.vercel.app/32"; \
	fi
	@echo ".env file generated successfully!"
