export default class BaseColumn {   
    constructor(public options: BaseColumnOptions) {

    }
}

export type RelationConfig = {
    collection: string;      // Target collection name
    valueField: string;      // Field to use as value (e.g., 'uuid')
    labelField: string;      // Field to display as label (e.g., 'email')
    labelFields?: string[];  // Multiple fields for composite label (e.g., ['first_name', 'last_name'])
}

export type BaseColumnOptions = {
    hidden?: boolean;
    required?: boolean;
    readOnly?: boolean;
    unique?: boolean;
    type?: 'text' | 'number' | 'boolean' | 'date' | 'time' | 'datetime' | 'json' | 'array' | 'object';
    relation?: RelationConfig;
    index?: boolean;
    defaultValue?: any;
    hooks?: {
        beforeChange?: (value: any) => any;
        afterChange?: (value: any) => any;
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