import  BaseColumn  from "@/shared/columns/BaseColumn";

export default class BaseCollection {
    created_at = new BaseColumn({ hidden: true });
    updated_at = new BaseColumn({ hidden: true });
    deleted_at = new BaseColumn({ hidden: true });
    data_in = new BaseColumn({ hidden: true, type: 'json' });
    data_out = new BaseColumn({ hidden: true, type: 'json' });
    uuid = new BaseColumn({ hidden: true });
    id = new BaseColumn({ hidden: true });
    xaid = new BaseColumn({ hidden: true });
    order = new BaseColumn({ hidden: true });
    constructor(public name: string = 'base') {}

    /**
     * Parse raw database data according to column type configurations.
     * Automatically parses JSON fields and ignores virtual columns.
     * 
     * @param data - Single row object or array of row objects from database
     * @returns Parsed data with JSON fields converted to objects
     */
    parse<T = any>(data: T | T[]): T | T[] {
        if (Array.isArray(data)) {
            return data.map(row => this.parseRow(row)) as T[]
        }
        return this.parseRow(data) as T
    }

    /**
     * Parse a single row according to column type configurations.
     */
    private parseRow(row: any): any {
        if (!row || typeof row !== 'object') {
            return row
        }

        const parsed = { ...row }

        // Iterate through all properties of this collection instance
        for (const key in this) {
            const field = this[key]
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
            
            // Skip if not a BaseColumn instance
            if (!(field instanceof BaseColumn)) {
                continue
            }

            // Skip virtual columns (they don't exist in DB)
            if (field.options.virtual) {
                continue
            }

            // Parse JSON fields

            if (field.options.type === 'json' && (parsed[key] != null || parsed[camelKey] != null)) {
                try {
                    const value = parsed[key] || parsed[camelKey]
                    if (typeof value === 'string') {
                        parsed[key] = JSON.parse(value)
                        parsed[camelKey] = JSON.parse(value)
                    }
                } catch (error) {
                    // Not valid JSON, keep as is
                    console.warn(`Failed to parse JSON field ${key} in collection ${this.name}:`, error)
                }
            }
        }

        return parsed
    }
  }