import { DbFilters, DbOrders, DbPagination } from "../types/shared";


export const parseQueryParams = (url: URL): { filters: DbFilters; orders: DbOrders; pagination: DbPagination } => {
    const filters: DbFilters = { conditions: [] }
    const orders: DbOrders = { orders: [] }
    const pagination: DbPagination = {}
  
    // Parse pagination
    const page = url.searchParams.get('page')
    const limit = url.searchParams.get('limit')
    if (page) pagination.page = parseInt(page, 10)
    if (limit) pagination.limit = parseInt(limit, 10)
  
    // Parse search filter
    const search = url.searchParams.get('search')
    if (search) {
      filters.conditions?.push({
        field: 'email',
        operator: 'like',
        values: [`%${search}%`],
      })
    }
  
    // Parse isActive filter
    const isActive = url.searchParams.get('isActive')
    if (isActive !== null) {
      filters.conditions?.push({
        field: 'isActive',
        operator: 'eq',
        values: [isActive === 'true'],
      })
    }
  
    // Parse orders (example: ?orderBy=createdAt&orderDirection=desc)
    const orderBy = url.searchParams.get('orderBy')
    const orderDirection = url.searchParams.get('orderDirection') as 'asc' | 'desc' | null
    if (orderBy && orderDirection) {
      orders.orders?.push({
        field: orderBy,
        direction: orderDirection,
      })
    } else {
      // Default order by createdAt desc
      orders.orders?.push({
        field: 'createdAt',
        direction: 'desc',
      })
    }
  
    // Always exclude soft-deleted records
    filters.conditions?.push({
      field: 'deletedAt',
      operator: 'isNull',
      values: [],
    })
  
    return { filters, orders, pagination }
  }