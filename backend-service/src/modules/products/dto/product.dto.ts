import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Create product DTO
 */
export class CreateProductDto {
    @ApiProperty({ example: 'Organic Coffee Beans' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Premium organic coffee beans from West Java' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 50000 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @ApiProperty({ example: 100 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stock: number;

    @ApiPropertyOptional({ example: ['coffee', 'organic', 'premium'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ example: 'beverages' })
    @IsOptional()
    @IsString()
    category?: string;
}

/**
 * Update product DTO
 */
export class UpdateProductDto {
    @ApiPropertyOptional({ example: 'Organic Coffee Beans' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'Premium organic coffee beans' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 55000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price?: number;

    @ApiPropertyOptional({ example: 150 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stock?: number;

    @ApiPropertyOptional({ example: ['coffee', 'organic'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

/**
 * Rate product DTO
 */
export class RateProductDto {
    @ApiProperty({ example: 'product123' })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: 4.5, minimum: 1, maximum: 5 })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    rating: number;

    @ApiPropertyOptional({ example: 'Great product!' })
    @IsOptional()
    @IsString()
    comment?: string;
}

/**
 * Product response DTO
 */
export class ProductDto {
    @ApiProperty({ example: 'prod123' })
    id: string;

    @ApiProperty({ example: 'Organic Coffee Beans' })
    name: string;

    @ApiPropertyOptional({ example: 'Premium organic coffee beans' })
    description?: string;

    @ApiProperty({ example: 50000 })
    price: number;

    @ApiProperty({ example: 100 })
    stock: number;

    @ApiPropertyOptional({ example: ['coffee', 'organic'] })
    tags?: string[];

    @ApiPropertyOptional({ example: 'partner123' })
    partnerId?: string;

    @ApiPropertyOptional({ example: 'My Business' })
    partnerName?: string;

    @ApiPropertyOptional({ example: 4.5 })
    averageRating?: number;

    @ApiPropertyOptional({ example: 25 })
    totalScans?: number;

    @ApiPropertyOptional({ type: [String], example: ['image1.jpg', 'image2.jpg'] })
    images?: string[];

    @ApiPropertyOptional({ example: 'QR_DATA_URI' })
    qrCode?: string;
}

/**
 * Product filter DTO
 */
export class ProductFilterDto {
    @ApiPropertyOptional({ example: 'coffee' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: 'beverages' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ example: 'partner123' })
    @IsOptional()
    @IsString()
    partnerId?: string;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minPrice?: number;

    @ApiPropertyOptional({ example: 100000 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxPrice?: number;
}
