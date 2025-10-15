import { NextRequest, NextResponse } from 'next/server';

export async function handleApiError(
  error: unknown,
  request: NextRequest
): Promise<NextResponse> {
  console.error('Unhandled API error:', {
    url: request.url,
    method: request.method,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : 'Internal server error',
      ...(isDevelopment && {
        details: error instanceof Error ? error.stack : String(error),
      }),
      timestamp: new Date().toISOString(),
      path: request.nextUrl.pathname,
    },
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

export function apiRoute<T = unknown>(
  handler: (request: NextRequest, context: T) => Promise<NextResponse> | NextResponse
): (request: NextRequest, context: T) => Promise<NextResponse>;
export function apiRoute(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
): (request: NextRequest) => Promise<NextResponse>;
export function apiRoute<T = unknown>(
  handler: (request: NextRequest, context?: T) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const response = await Promise.resolve(handler(request, context as T));
      
      if (!response.headers.get('Content-Type')) {
        response.headers.set('Content-Type', 'application/json');
      }
      
      return response;
    } catch (error) {
      return handleApiError(error, request);
    }
  };
}

