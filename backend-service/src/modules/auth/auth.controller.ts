import {
    Controller,
    Post,
    Body,
    Get,
    Req,
    Res,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
    LoginDto,
    RegisterUserDto,
    PasswordResetDto,
    LoginResponseDto,
    CurrentUserDto,
} from './dto';
import { createSuccessResponse, ApiSuccessResponse } from 'src/common/dto';
import { cookieOptions } from 'src/main';
import { CookieAuthGuard } from 'src/auth.guard';
import { idCookie } from 'src/auth/cookies.model';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'User login', description: 'Authenticate with email and password' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: LoginResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { user, sessionCookie } = await this.authService.login(dto);

        // Set cookies for session management
        res.cookie('id', user, cookieOptions);
        res.cookie('session', sessionCookie, cookieOptions);

        return createSuccessResponse(user, 'Login successful');
    }

    @Post('register')
    @ApiOperation({ summary: 'Register new user', description: 'Create a new user account (mobile)' })
    @ApiBody({ type: RegisterUserDto })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async register(@Body() dto: RegisterUserDto) {
        const result = await this.authService.registerUser(dto);
        return createSuccessResponse(result, 'User registered successfully');
    }

    @Post('logout')
    @UseGuards(CookieAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'User logout', description: 'Logout and revoke session' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { uid }: idCookie = req.signedCookies.id;

        await this.authService.logout(uid);

        res.clearCookie('session');
        res.clearCookie('id');

        return createSuccessResponse(null, 'Logout successful');
    }

    @Post('password/reset')
    @ApiOperation({ summary: 'Request password reset', description: 'Send password reset email' })
    @ApiBody({ type: PasswordResetDto })
    @ApiResponse({ status: 200, description: 'Password reset email sent' })
    async requestPasswordReset(@Body() dto: PasswordResetDto) {
        await this.authService.requestPasswordReset(dto.email);
        return createSuccessResponse(null, 'Password reset email sent');
    }

    @Get('me')
    @UseGuards(CookieAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user', description: 'Get authenticated user data' })
    @ApiResponse({ status: 200, description: 'User data retrieved', type: CurrentUserDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getCurrentUser(@Req() req: Request) {
        const { email }: idCookie = req.signedCookies.id;
        const user = await this.authService.getCurrentUser(email);
        return createSuccessResponse(user);
    }
}
