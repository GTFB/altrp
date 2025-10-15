import { NextRequest, NextResponse } from 'next/server';

export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function formatErrorResponse(
  error: unknown,
  defaultMessage: string = 'Internal server error'
): ApiErrorResponse {
  const timestamp = new Date().toISOString();

  if (error instanceof ApiError) {
    return {
      error: error.message,
      details: error.details,
      statusCode: error.statusCode,
      timestamp,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
      timestamp,
    };
  }

  return {
    error: defaultMessage,
    details: typeof error === 'string' ? error : undefined,
    statusCode: 500,
    timestamp,
  };
}

export function withErrorHandler<T = unknown>(
  handler: (request: NextRequest, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      
      const errorResponse = formatErrorResponse(error);
      
      return NextResponse.json(
        {
          error: errorResponse.error,
          message: errorResponse.message,
          details: process.env.NODE_ENV === 'development' ? errorResponse.details : undefined,
          timestamp: errorResponse.timestamp,
          path: request.nextUrl.pathname,
        },
        { 
          status: errorResponse.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}

export async function parseRequestBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new ApiError('Invalid JSON in request body', 400, error);
  }
}

export const ApiResponse = {
  success: (data: unknown, status = 200) => {
    return NextResponse.json(data, { 
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  error: (message: string, status = 500, details?: unknown) => {
    return NextResponse.json(
      formatErrorResponse(new ApiError(message, status, details)),
      { 
        status,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },

  badRequest: (message: string, details?: unknown) => {
    return ApiResponse.error(message, 400, details);
  },

  unauthorized: (message = 'Unauthorized') => {
    return ApiResponse.error(message, 401);
  },

  forbidden: (message = 'Forbidden') => {
    return ApiResponse.error(message, 403);
  },

  notFound: (message = 'Not found') => {
    return ApiResponse.error(message, 404);
  },

  serverError: (message = 'Internal server error', details?: unknown) => {
    return ApiResponse.error(message, 500, details);
  },
};

