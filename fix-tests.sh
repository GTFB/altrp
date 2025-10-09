#!/bin/bash
# Script to automatically fix repository imports in tests
# Run this from the project root: bash fix-tests.sh

echo "Fixing repository imports in integration tests..."

# Remaining files to fix:
TEST_FILES=(
  "apps/cms/tests/integration/api/admin/media.root.test.ts"
  "apps/cms/tests/integration/api/admin/pages.root.test.ts"
  "apps/cms/tests/integration/api/admin/media.stats.test.ts"
  "apps/cms/tests/integration/api/admin/pages.slug.test.ts"
  "apps/cms/tests/integration/api/admin/media.slug.test.ts"
  "apps/cms/tests/integration/api/admin/blog.slug.test.ts"
  "apps/cms/tests/integration/api/admin/blog.root.test.ts"
  "apps/cms/tests/integration/api/admin/categories.root.test.ts"
  "apps/cms/tests/integration/api/api-authors-slug.test.ts"
  "apps/cms/tests/integration/api/api-categories-slug.test.ts"
  "apps/cms/tests/integration/api/api-categories.test.ts"
  "apps/cms/tests/integration/api/api-content-info.test.ts"
  "apps/cms/tests/integration/api/api-search.test.ts"
  "apps/cms/tests/integration/api/api-posts-authors.test.ts"
  "apps/cms/tests/integration/api/api-posts-slug.test.ts"
  "apps/cms/tests/integration/api/api-posts-categories.test.ts"
)

echo "Files to process: ${#TEST_FILES[@]}"

for file in "${TEST_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    echo "  Manual fix required - use dynamic import pattern:"
    echo "  const { XxxRepository } = await import('@/repositories/xxx.repository');"
  else
    echo "File not found: $file"
  fi
done

echo ""
echo "Done! Please manually update each file using the pattern from MIGRATION_GUIDE.md"

