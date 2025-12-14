import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * User response DTO
 */
export class UserDto {
    @ApiProperty({ example: 'user123' })
    uid: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiPropertyOptional({ example: 'John Doe' })
    name?: string;

    @ApiProperty({ example: 'user' })
    role: string;

    @ApiPropertyOptional({ example: 'My Business' })
    businessName?: string;

    @ApiPropertyOptional({ example: '+6281234567890' })
    phone?: string;

    @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
    createdAt?: string;
}

/**
 * Update user DTO
 */
export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John Doe' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: '+6281234567890' })
    @IsOptional()
    @IsString()
    phone?: string;
}

/**
 * Update user role DTO
 */
export class UpdateRoleDto {
    @ApiProperty({ example: 'admin', enum: ['user', 'partner', 'approver', 'admin'] })
    @IsString()
    @IsNotEmpty()
    role: string;
}

/**
 * Create user DTO (admin)
 */
export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'user', enum: ['user', 'partner', 'approver', 'admin'] })
    @IsString()
    @IsNotEmpty()
    role: string;
}
