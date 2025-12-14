import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Pagination query parameters
 */
export class PaginationDto {
    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Search query' })
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ description: 'Sort field' })
    @IsOptional()
    sortBy?: string;

    @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
    @IsOptional()
    sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * Pagination metadata
 */
export class PaginationMeta {
    @ApiProperty({ example: 100 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 10 })
    totalPages: number;

    @ApiProperty({ example: true })
    hasNextPage: boolean;

    @ApiProperty({ example: false })
    hasPrevPage: boolean;
}

/**
 * Paginated response wrapper
 */
export class PaginatedResponse<T> {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ isArray: true })
    data: T[];

    @ApiProperty({ type: PaginationMeta })
    meta: PaginationMeta;
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
        success: true,
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}
