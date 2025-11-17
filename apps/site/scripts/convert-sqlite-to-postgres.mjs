#!/usr/bin/env node

/**
 * Converts SQLite SQL syntax to PostgreSQL syntax
 * Used for converting migration files on-the-fly
 */

export function convertSqliteToPostgres(sql) {
  let converted = sql;

  // Convert table names from backticks to double quotes (PostgreSQL style)
  converted = converted.replace(/`([^`]+)`/g, '"$1"');

  // Convert INTEGER PRIMARY KEY to SERIAL PRIMARY KEY or BIGSERIAL
  // But only for auto-increment primary keys
  converted = converted.replace(
    /(\w+)\s+integer\s+PRIMARY\s+KEY\s+(?:NOT\s+NULL\s+)?AUTOINCREMENT/gi,
    '$1 BIGSERIAL PRIMARY KEY'
  );

  // Convert INTEGER PRIMARY KEY NOT NULL to BIGSERIAL PRIMARY KEY
  converted = converted.replace(
    /(\w+)\s+integer\s+PRIMARY\s+KEY\s+NOT\s+NULL/gi,
    '$1 BIGSERIAL PRIMARY KEY'
  );

  // Convert INTEGER PRIMARY KEY to BIGINT PRIMARY KEY (for non-auto-increment)
  converted = converted.replace(
    /(\w+)\s+integer\s+PRIMARY\s+KEY(?!\s+(?:NOT\s+NULL\s+)?AUTOINCREMENT)/gi,
    '$1 BIGINT PRIMARY KEY'
  );

  // NOTE: Do not convert generic INTEGER types yet.
  // Some column-specific transformations (like boolean detection) rely on the original "integer" keyword.

  // Convert NUMERIC to NUMERIC (same, but PostgreSQL uses DECIMAL/NUMERIC)
  // Keep as NUMERIC

  // Convert strftime to PostgreSQL NOW()
  converted = converted.replace(
    /strftime\('%Y-%m-%dT%H:%M:%fZ',\s*'now'\)/gi,
    "NOW()"
  );

  // Convert DEFAULT (strftime(...)) to DEFAULT NOW()
  converted = converted.replace(
    /DEFAULT\s*\(strftime\([^)]+\)\)/gi,
    'DEFAULT NOW()'
  );

  // Helper to convert integer/bigint column definitions to BOOLEAN when they represent flags.
  const booleanizeColumn = (definition) => {
    return definition
      // Columns named is_* should be BOOLEAN
      .replace(/(["`]?is_[\w]+"?\s+)(?:integer|bigint)\b/gi, '$1BOOLEAN')
      // Columns with boolean defaults (true/false) should use BOOLEAN type
      .replace(
        /(["`]?[\w]+"?\s+)(?:integer|bigint)(\s+(?:NOT\s+NULL\s+)?)?(?=\s+DEFAULT\s+(?:true|false))/gi,
        (match, column, modifiers = '') => `${column}BOOLEAN${modifiers}`
      )
      // Columns with boolean defaults represented as 0/1 and named like is_* should also be BOOLEAN
      .replace(
        /(["`]?is_[\w]+"?\s+)(?:integer|bigint)(\s+(?:NOT\s+NULL\s+)?)?(?=\s+DEFAULT\s+[01])/gi,
        (match, column, modifiers = '') => `${column}BOOLEAN${modifiers}`
      );
  };

  converted = booleanizeColumn(converted);

  // Normalize DEFAULT values of boolean columns
  converted = converted.replace(
    /(BOOLEAN(?:\s+NOT\s+NULL)?\s+DEFAULT\s+)([01])/gi,
    (_, prefix, value) => `${prefix}${value === '1' ? 'true' : 'false'}`
  );

  // After boolean conversions, handle remaining integer defaults.
  converted = converted.replace(
    /(BOOLEAN(?:\s+NOT\s+NULL)?\s+)DEFAULT\s+(true|false)/gi,
    (_, prefix, value) => `${prefix}DEFAULT ${value.toLowerCase()}`
  );

  converted = converted.replace(
    /(BOOLEAN(?:\s+NOT\s+NULL)?\s+)DEFAULT\s+([01])/gi,
    (_, prefix, value) => `${prefix}DEFAULT ${value === '1' ? 'true' : 'false'}`
  );

  // Convert CREATE TABLE IF NOT EXISTS (PostgreSQL supports this)
  // Keep as is

  // Convert AUTOINCREMENT (already handled above)
  
  // Convert CREATE INDEX syntax (PostgreSQL uses same syntax but with quotes)
  // Already handled by backtick conversion

  // Convert UNIQUE INDEX to CREATE UNIQUE INDEX (PostgreSQL syntax)
  // Already compatible

  // Convert ALTER TABLE syntax
  // PostgreSQL uses similar syntax

  // Convert DROP COLUMN syntax
  // PostgreSQL uses same syntax

  // Convert ADD COLUMN syntax  
  // PostgreSQL uses same syntax but may need type conversion
  converted = converted.replace(
    /ALTER\s+TABLE\s+"?(\w+)"?\s+ADD\s+"?(\w+)"?\s+integer\s+DEFAULT\s+(true|false)/gi,
    'ALTER TABLE "$1" ADD "$2" BOOLEAN DEFAULT $3'
  );

  // Now convert remaining INTEGER keywords (that weren't converted to BOOLEAN or SERIAL)
  converted = converted.replace(/\binteger\b/gi, 'BIGINT');

  // Handle numeric types - keep as NUMERIC in PostgreSQL
  // NUMERIC is compatible

  // Remove SQLite-specific syntax
  // Most common SQLite features are handled above

  return converted;
}

// If run directly, convert stdin to stdout
if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('fs');
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Read from stdin
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    process.stdin.on('end', () => {
      const converted = convertSqliteToPostgres(input);
      process.stdout.write(converted);
    });
  } else {
    // Read from file
    const filePath = args[0];
    const sql = fs.readFileSync(filePath, 'utf8');
    const converted = convertSqliteToPostgres(sql);
    
    if (args[1]) {
      // Write to output file
      fs.writeFileSync(args[1], converted, 'utf8');
    } else {
      // Write to stdout
      process.stdout.write(converted);
    }
  }
}

