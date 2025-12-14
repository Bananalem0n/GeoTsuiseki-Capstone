import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Partner response DTO
 */
export class PartnerDto {
    @ApiProperty({ example: 'partner123' })
    id: string;

    @ApiProperty({ example: 'My Business' })
    businessName: string;

    @ApiPropertyOptional({ example: 'owner@business.com' })
    email?: string;

    @ApiPropertyOptional({ example: '1234567890123' })
    nib?: string;

    @ApiPropertyOptional({ example: '+6281234567890' })
    telephone?: string;

    @ApiPropertyOptional({ example: 'Business description' })
    description?: string;

    @ApiPropertyOptional({ example: 'logo_file_id' })
    logo?: string;

    @ApiProperty({ example: 'verified' })
    status: 'pending' | 'verified' | 'rejected';

    @ApiPropertyOptional({ example: 10 })
    productCount?: number;

    @ApiPropertyOptional({ example: 5 })
    employeeCount?: number;

    @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
    createdAt?: string;
}

/**
 * Update partner DTO
 */
export class UpdatePartnerDto {
    @ApiPropertyOptional({ example: '+6281234567890' })
    @IsOptional()
    @IsString()
    telephone?: string;

    @ApiPropertyOptional({ example: 'Updated business description' })
    @IsOptional()
    @IsString()
    description?: string;
}

/**
 * Partner employee DTO
 */
export class EmployeeDto {
    @ApiProperty({ example: 'John Doe' })
    name: string;

    @ApiPropertyOptional({ example: 'Manager' })
    role?: string;

    @ApiPropertyOptional({ example: 'https://linkedin.com/in/johndoe' })
    link?: string;

    @ApiPropertyOptional({ example: 'Employee bio' })
    bio?: string;

    @ApiPropertyOptional({ example: 'image_file_id' })
    image?: string;
}

/**
 * Create employee DTO
 */
export class CreateEmployeeDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Manager' })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional({ example: 'https://linkedin.com/in/johndoe' })
    @IsOptional()
    @IsString()
    link?: string;

    @ApiPropertyOptional({ example: 'Employee bio' })
    @IsOptional()
    @IsString()
    bio?: string;
}

/**
 * Pending partner (for approval) DTO
 */
export class PendingPartnerDto extends PartnerDto {
    @ApiProperty({ example: 'John Owner' })
    ownerName: string;
}

/**
 * Partner analytics DTO
 */
export class PartnerAnalyticsDto {
    @ApiProperty({ example: 10 })
    totalProducts: number;

    @ApiProperty({ example: 250 })
    totalScans: number;

    @ApiProperty({ example: 5 })
    totalEmployees: number;

    @ApiProperty({ example: 4.5 })
    averageRating: number;

    @ApiPropertyOptional({ type: [Object] })
    topProducts?: { id: string; name: string; scans: number }[];
}
