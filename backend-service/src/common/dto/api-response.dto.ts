import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard API success response wrapper
 */
export class ApiSuccessResponse<T> {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty()
    data: T;

    @ApiPropertyOptional({ example: 'Operation successful' })
    message?: string;
}

/**
 * Error details for API responses
 */
export class ApiErrorDetail {
    @ApiProperty({ example: 'VALIDATION_ERROR' })
    code: string;

    @ApiProperty({ example: 'Invalid input data' })
    message: string;

    @ApiPropertyOptional({ type: [String] })
    details?: string[];
}

/**
 * Standard API error response wrapper
 */
export class ApiErrorResponse {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ type: ApiErrorDetail })
    error: ApiErrorDetail;
}

/**
 * Helper to create success responses
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiSuccessResponse<T> {
    return {
        success: true,
        data,
        message,
    };
}

/**
 * Helper to create error responses
 */
export function createErrorResponse(
    code: string,
    message: string,
    details?: string[],
): ApiErrorResponse {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
    };
}
