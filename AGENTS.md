# Agent map (token-cost guide)

## Prefer settings over runtime
1. Route/table behavior → `packages/components/blocks-app/admin/private-config/**/*.settings.ts`
2. DSL schema → `packages/components/blocks-app/admin/cabinet-constructor/types/` (re-export: `types.ts`)
3. DSL editor UI → `packages/components/blocks-app/admin/config-editor/` (`Dsl*`, hooks) — not full DataTable
4. Column DSL helpers → `data-table/utils/column-dsl-*.ts`
5. Runtime only if behavior cannot live in settings/plugins

## Data-table entry points
- Mount tables via `LazyDataTable` (`data-table/LazyDataTable.tsx`)
- Public barrel `data-table/index.ts` exports LazyDataTable + types only — use **subpath imports** for everything else
- Collection-specific UI → `data-table/plugins/<collection>/`
- Column cell factories → `data-table/functions/column-factories/`
- Form field registry → `data-table/forms/`

## Agent rules
- Token discipline + CI: `.cursor/rules/agent-core.mdc` (alwaysApply)
- Product style: `.cursor/rules/golden-rules.mdc`
- Domain (globs): `journal-architecture`, `editor-cabinet-collections`, `data-table-scoped-edit`

## Do not
- Full-read god files (`DataTable.tsx`, `DataTableFormDialog.tsx`, `generateColumns.tsx`, large callbacks) — use Grep + partial Read
- Import from barrel for internal widgets (RelationSelect, Toolbar, etc.)
- Put new collection `if` branches in `DataTable.tsx` — add a plugin
- Reintroduce `middleware.ts` (use `proxy.ts` only when required)

## Module layout
- Features: `packages/modules/<id>/` + `module.json`; generated barrels in `packages/generated/`
- Shared UI: `packages/components/`; apps: `apps/app`, `apps/site`, `apps/cms`, `apps/bot`
- Ignore build noise: see `.cursorignore` (`.open-next`, `.deploy-stash`, `vendor/`, …)

## structurest.md
Project tree index for agents; update when adding/removing files or folders.
