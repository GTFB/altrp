export class APIError extends Error {
	constructor(
		public statusCode: number,
		public message: string,
		public code?: string
	) {
		super(message);
		this.name = 'APIError';
	}
}

export class ValidationError extends APIError {
	constructor(message: string, public field?: string) {
		super(400, message, 'VALIDATION_ERROR');
		this.name = 'ValidationError';
	}
}

export class AuthenticationError extends APIError {
	constructor(message = 'Unauthorized') {
		super(401, message, 'AUTH_ERROR');
		this.name = 'AuthenticationError';
	}
}

export class RateLimitError extends APIError {
	constructor(message = 'Too Many Requests') {
		super(429, message, 'RATE_LIMIT_ERROR');
		this.name = 'RateLimitError';
	}
}

export class BudgetExceededError extends APIError {
	constructor(message = 'Budget exceeded') {
		super(402, message, 'BUDGET_EXCEEDED');
		this.name = 'BudgetExceededError';
	}
}

export function handleError(error: unknown): { statusCode: number; message: string; code?: string } {
	if (error instanceof APIError) {
		return {
			statusCode: error.statusCode,
			message: error.message,
			code: error.code
		};
	}
	
	if (error instanceof Error) {
		console.error('Unexpected error:', error);
		return {
			statusCode: 500,
			message: 'Internal Server Error',
			code: 'INTERNAL_ERROR'
		};
	}
	
	return {
		statusCode: 500,
		message: 'Unknown error occurred',
		code: 'UNKNOWN_ERROR'
	};
}
