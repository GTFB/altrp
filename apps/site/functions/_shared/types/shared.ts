export type DbFilterOperator = "exclude" | "like" | "in" | "notIn" | "isNull" | "isNotNull" | "between" | "notBetween" | "gt" | "gte" | "lt" | "lte" | "eq" | "neq";

export interface DbFilterCondition {
    field: string;
    operator: DbFilterOperator;
    values: Array<string | number | boolean | null>;
}

export interface DbFilters {
    conditions?: DbFilterCondition[];
}

export interface DbOrder {
    field: string;
    direction: 'asc' | 'desc';
}

export interface DbOrders {
    orders?: DbOrder[];
}

export interface DbPagination {
    page?: number;
    limit?: number;
}

export interface DbPaginationResult {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface DbPaginatedResult<T> {
    docs: T[];
    pagination: DbPaginationResult;
}