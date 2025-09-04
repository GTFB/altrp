# Use POSIX shell for portability
SHELL := /bin/sh

.PHONY: help init install dev build lint format prepare tailwind shadcn hygen test clean branch commit component

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
	@echo "  test      - Run unit tests with Bun"
	@echo "  branch    - Create/switch branch: make branch BR=name"
	@echo "  commit    - Git add & commit: make commit MSG=\"message\""

install:
	bun install

dev:
	bun run dev

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
