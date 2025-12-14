import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserDto, UpdateUserDto, UpdateRoleDto, CreateUserDto } from './dto';
import { PaginationDto, createSuccessResponse } from 'src/common/dto';
import { CookieAuthGuard } from 'src/auth.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from 'src/auth/guard/roles.enum';

@ApiTags('users')
@Controller('users')
@UseGuards(CookieAuthGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'List all users', description: 'Get paginated list of users (Admin only)' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    async findAll(@Query() pagination: PaginationDto) {
        return this.usersService.findAll(pagination);
    }

    @Get(':email')
    @ApiOperation({ summary: 'Get user by email', description: 'Get user details by email (Admin only)' })
    @ApiParam({ name: 'email', description: 'User email' })
    @ApiResponse({ status: 200, description: 'User retrieved', type: UserDto })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findOne(@Param('email') email: string) {
        const user = await this.usersService.findOne(email);
        return createSuccessResponse(user);
    }

    @Post()
    @ApiOperation({ summary: 'Create user', description: 'Create a new user (Admin only)' })
    @ApiResponse({ status: 201, description: 'User created', type: UserDto })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async create(@Body() dto: CreateUserDto) {
        const user = await this.usersService.create(dto);
        return createSuccessResponse(user, 'User created successfully');
    }

    @Put(':email')
    @ApiOperation({ summary: 'Update user', description: 'Update user details (Admin only)' })
    @ApiParam({ name: 'email', description: 'User email' })
    @ApiResponse({ status: 200, description: 'User updated', type: UserDto })
    async update(@Param('email') email: string, @Body() dto: UpdateUserDto) {
        const user = await this.usersService.update(email, dto);
        return createSuccessResponse(user, 'User updated successfully');
    }

    @Put(':email/role')
    @ApiOperation({ summary: 'Update user role', description: 'Update user role (Admin only)' })
    @ApiParam({ name: 'email', description: 'User email' })
    @ApiResponse({ status: 200, description: 'Role updated', type: UserDto })
    async updateRole(@Param('email') email: string, @Body() dto: UpdateRoleDto) {
        const user = await this.usersService.updateRole(email, dto);
        return createSuccessResponse(user, 'User role updated successfully');
    }

    @Delete(':email')
    @ApiOperation({ summary: 'Delete user', description: 'Delete a user (Admin only)' })
    @ApiParam({ name: 'email', description: 'User email' })
    @ApiResponse({ status: 200, description: 'User deleted' })
    async delete(@Param('email') email: string) {
        await this.usersService.delete(email);
        return createSuccessResponse(null, 'User deleted successfully');
    }
}
