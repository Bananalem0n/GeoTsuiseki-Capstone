import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { createErrorResponse } from '../dto';

/**
 * Global HTTP exception filter
 * Transforms all exceptions into standard API error response format
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let code = 'INTERNAL_ERROR';
        let message = 'An unexpected error occurred';
        let details: string[] | undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as Record<string, unknown>;
                message = (responseObj.message as string) || message;

                // Handle validation errors
                if (Array.isArray(responseObj.message)) {
                    details = responseObj.message;
                    message = 'Validation failed';
                }
            }

            // Map status to error code
            code = this.getErrorCode(status);
        } else if (exception instanceof Error) {
            message = exception.message;
            console.error('Unhandled error:', exception);
        }

        response.status(status).json(createErrorResponse(code, message, details));
    }

    private getErrorCode(status: number): string {
        const codeMap: Record<number, string> = {
            [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
            [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
            [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
            [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
            [HttpStatus.CONFLICT]: 'CONFLICT',
            [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
            [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
            [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
        };

        return codeMap[status] || 'UNKNOWN_ERROR';
    }
}
