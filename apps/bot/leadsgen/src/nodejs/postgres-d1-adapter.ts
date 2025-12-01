import type { Pool } from 'pg';

/**
 * PostgreSQL adapter that mimics D1Database API
 * This allows existing repositories to work with PostgreSQL without changes
 */
export class PostgresD1Adapter {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Prepare a SQL statement (returns a PreparedStatement-like object)
   */
  prepare(query: string): PostgresPreparedStatement {
    return new PostgresPreparedStatement(this.pool, query);
  }
}

/**
 * PreparedStatement-like class that mimics D1's prepare().bind().run()/all()/first() API
 */
class PostgresPreparedStatement {
  private pool: Pool;
  private query: string;
  private params: any[] = [];

  constructor(pool: Pool, query: string) {
    this.pool = pool;
    this.query = query;
  }

  /**
   * Bind parameters to the query
   */
  bind(...params: any[]): PostgresPreparedStatement {
    this.params = params;
    return this;
  }

  /**
   * Execute query and return result with success/meta structure (like D1 run())
   */
  async run(): Promise<{ success: boolean; meta: { last_row_id?: number; changes?: number }; error?: string }> {
    try {
      // Convert D1-style query to PostgreSQL
      const pgQuery = this.convertQuery(this.query);
      
      // Execute query using pg
      const result = await this.pool.query(pgQuery, this.params);
      
      // For INSERT, get last inserted ID from RETURNING clause or use result.rows[0].id
      let lastRowId: number | undefined;
      if (pgQuery.trim().toUpperCase().startsWith('INSERT')) {
        if (result.rows && result.rows.length > 0 && result.rows[0].id) {
          lastRowId = Number(result.rows[0].id);
        } else {
          // Try to get from LASTVAL()
          const idResult = await this.pool.query('SELECT LASTVAL() as id');
          if (idResult.rows && idResult.rows.length > 0) {
            lastRowId = Number(idResult.rows[0].id);
          }
        }
      }

      // For UPDATE/DELETE, get affected rows from rowCount
      let changes: number | undefined;
      if (pgQuery.trim().toUpperCase().startsWith('UPDATE') || pgQuery.trim().toUpperCase().startsWith('DELETE')) {
        changes = result.rowCount || 0;
      }

      return {
        success: true,
        meta: {
          last_row_id: lastRowId,
          changes: changes
        }
      };
    } catch (error: any) {
      console.error('PostgreSQL query error:', error);
      return {
        success: false,
        meta: {},
        error: error.message
      };
    }
  }

  /**
   * Execute query and return all results (like D1 all())
   */
  async all(): Promise<{ success: boolean; results?: any[]; error?: string }> {
    try {
      const pgQuery = this.convertQuery(this.query);
      const result = await this.pool.query(pgQuery, this.params);
      
      return {
        success: true,
        results: result.rows || []
      };
    } catch (error: any) {
      console.error('PostgreSQL query error:', error);
      return {
        success: false,
        results: [],
        error: error.message
      };
    }
  }

  /**
   * Execute query and return first result (like D1 first())
   */
  async first(): Promise<any | null> {
    try {
      const pgQuery = this.convertQuery(this.query);
      const result = await this.pool.query(pgQuery, this.params);
      
      if (result.rows && result.rows.length > 0) {
        return result.rows[0];
      }
      return null;
    } catch (error: any) {
      console.error('PostgreSQL query error:', error);
      return null;
    }
  }

  /**
   * Convert D1/SQLite query syntax to PostgreSQL
   */
  private convertQuery(query: string): string {
    let converted = query;

    // Convert backticks to double quotes (PostgreSQL style)
    converted = converted.replace(/`([^`]+)`/g, '"$1"');

    // Convert CAST(json_extract(column, '$.path') AS INTEGER) to PostgreSQL
    // This pattern handles: CAST(json_extract(...) AS INTEGER)
    // Must be done BEFORE converting plain json_extract
    converted = converted.replace(
      /CAST\s*\(\s*json_extract\(\s*([^)]+?)\s*,\s*'([^']+)'\s*\)\s*AS\s+INTEGER\s*\)/gi,
      (match, columnExpr, path) => {
        const cleanPath = path.replace(/^\$\./, '');
        const segments = cleanPath.split('.');
        let expr = `${columnExpr.trim()}::jsonb`;
        segments.forEach((segment, index) => {
          const accessor = /^\d+$/.test(segment) ? segment : `'${segment}'`;
          const operator = index === segments.length - 1 ? '->>' : '->';
          expr = `(${expr} ${operator} ${accessor})`;
        });
        // Cast to bigint for PostgreSQL (INTEGER in SQLite = BIGINT in PostgreSQL)
        return `(${expr})::bigint`;
      }
    );

    // Convert json_extract(column, '$.path.to.field') to PostgreSQL JSON operators
    // (for cases without CAST - only if not already converted above)
    converted = converted.replace(
      /json_extract\(\s*([^)]+?)\s*,\s*'([^']+)'\s*\)/gi,
      (match, columnExpr, path) => {
        const cleanPath = path.replace(/^\$\./, '');
        const segments = cleanPath.split('.');
        let expr = `${columnExpr.trim()}::jsonb`;
        segments.forEach((segment, index) => {
          const accessor = /^\d+$/.test(segment) ? segment : `'${segment}'`;
          const operator = index === segments.length - 1 ? '->>' : '->';
          expr = `(${expr} ${operator} ${accessor})`;
        });
        return expr;
      }
    );

    // Convert ? placeholders to $1, $2, etc. (PostgreSQL style)
    // The postgres library uses $1, $2, etc. for parameters
    let paramIndex = 1;
    converted = converted.replace(/\?/g, () => `$${paramIndex++}`);

    return converted;
  }
}

