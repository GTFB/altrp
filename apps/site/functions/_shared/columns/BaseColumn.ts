import { Context, AdminFilter } from '../types'
export default class BaseColumn {   
    constructor(public options: BaseColumnOptions) {

    }
}

export type RelationConfig = {
    collection: string;      // Target collection name
    valueField: string;      // Field to use as value (e.g., 'uuid')
    labelField: string;      // Field to display as label (e.g., 'email')
    labelFields?: string[];  // Multiple fields for composite label (e.g., ['first_name', 'last_name'])
    // Optional default filters to apply when fetching relation options
    filters?: AdminFilter[];
    // If true, propagate parent table search (s) to relation fetch
    inheritSearch?: boolean;
}

export type BaseColumnOptions = {
    title?: string;
    hidden?: boolean;
    hiddenTable?: boolean;  // Hide only in table, but show in forms
    required?: boolean;
    readOnly?: boolean;
    unique?: boolean;
    virtual?: boolean;  // Virtual field, computed on backend
    value?: (instance: any) => Promise<any> | any;  // Required if virtual = true
    type?: 'text' | 'number' | 'email' | 'phone' | 'password' | 'boolean' | 'date' | 'time' | 'datetime' | 'json' | 'array' | 'object' | 'price' | 'enum';
    enum?: {
        values: string[];
        labels: string[];
    };
    relation?: RelationConfig;
    index?: boolean;
    defaultValue?: any;
    defaultCell?: any;  // Default value to display in table cell when value is empty/null
    hooks?: {
        beforeChange?: (value: any, instance: any) => any;
        afterChange?: (value: any, instance: any) => any;
        beforeSave?: (value: any, instance: any, context: Context) => any;
    };
    format?: (value: any, locale?: string) => any;
    validate?: (value: any) => boolean;
    transform?: (value: any) => any;
    filter?: (value: any) => any;
    sort?: (value: any) => any;
    search?: (value: any) => any;
    group?: (value: any) => any;
    groupBy?: (value: any) => any;
}