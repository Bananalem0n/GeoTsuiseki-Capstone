import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Login request DTO
 */
export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

/**
 * Login response DTO
 */
export class LoginResponseDto {
    @ApiProperty({ example: 'user123' })
    uid: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: 'admin' })
    role: string;

    @ApiPropertyOptional({ example: 'My Business' })
    businessName?: string;
}

/**
 * Register user (mobile) DTO
 */
export class RegisterUserDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ example: '+6281234567890' })
    @IsOptional()
    @IsString()
    phone?: string;
}

/**
 * Register partner DTO
 */
export class RegisterPartnerDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'partner@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'My Business Name' })
    @IsString()
    @IsNotEmpty()
    businessName: string;

    @ApiProperty({ example: '1234567890123' })
    @IsString()
    @IsNotEmpty()
    nib: string;

    @ApiPropertyOptional({ example: '+6281234567890' })
    @IsOptional()
    @IsString()
    telephone?: string;

    @ApiPropertyOptional({ example: 'Business description here' })
    @IsOptional()
    @IsString()
    deskripsi?: string;
}

/**
 * Password reset request DTO
 */
export class PasswordResetDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

/**
 * Current user response DTO
 */
export class CurrentUserDto {
    @ApiProperty({ example: 'user123' })
    uid: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: 'John Doe' })
    name: string;

    @ApiProperty({ example: 'user' })
    role: string;

    @ApiPropertyOptional({ example: 'My Business' })
    businessName?: string;
}
