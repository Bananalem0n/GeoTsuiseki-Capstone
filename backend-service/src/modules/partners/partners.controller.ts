import {
    Controller,
    Get,
    Put,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import {
    PartnerDto,
    UpdatePartnerDto,
    EmployeeDto,
    PendingPartnerDto,
    PartnerAnalyticsDto,
} from './dto';
import { PaginationDto, createSuccessResponse } from 'src/common/dto';
import { CookieAuthGuard } from 'src/auth.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from 'src/auth/guard/roles.enum';

@ApiTags('partners')
@Controller('partners')
export class PartnersController {
    constructor(private readonly partnersService: PartnersService) { }

    @Get()
    @ApiOperation({ summary: 'List all partners', description: 'Get paginated list of verified partners' })
    @ApiResponse({ status: 200, description: 'Partners retrieved successfully' })
    async findAll(@Query() pagination: PaginationDto) {
        return this.partnersService.findAll(pagination);
    }

    @Get('pending')
    @UseGuards(CookieAuthGuard)
    @Roles(Role.Admin, Role.Approver)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List pending partners', description: 'Get partners awaiting approval (Admin only)' })
    @ApiResponse({ status: 200, description: 'Pending partners retrieved' })
    async findPending() {
        const partners = await this.partnersService.findPending();
        return createSuccessResponse(partners);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get partner by ID', description: 'Get partner details by ID' })
    @ApiParam({ name: 'id', description: 'Partner ID' })
    @ApiResponse({ status: 200, description: 'Partner retrieved', type: PartnerDto })
    @ApiResponse({ status: 404, description: 'Partner not found' })
    async findOne(@Param('id') id: string) {
        const partner = await this.partnersService.findOne(id);
        return createSuccessResponse(partner);
    }

    @Put(':id')
    @UseGuards(CookieAuthGuard)
    @Roles(Role.Partner, Role.Admin)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update partner', description: 'Update partner profile' })
    @ApiParam({ name: 'id', description: 'Partner ID' })
    @ApiResponse({ status: 200, description: 'Partner updated', type: PartnerDto })
    async update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
        const partner = await this.partnersService.update(id, dto);
        return createSuccessResponse(partner, 'Partner updated successfully');
    }

    @Get(':id/employees')
    @ApiOperation({ summary: 'Get partner employees', description: 'Get list of partner employees' })
    @ApiParam({ name: 'id', description: 'Partner ID' })
    @ApiResponse({ status: 200, description: 'Employees retrieved', type: [EmployeeDto] })
    async getEmployees(@Param('id') id: string) {
        const employees = await this.partnersService.getEmployees(id);
        return createSuccessResponse(employees);
    }

    @Get(':id/analytics')
    @UseGuards(CookieAuthGuard)
    @Roles(Role.Partner, Role.Admin)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get partner analytics', description: 'Get analytics data for partner' })
    @ApiParam({ name: 'id', description: 'Partner ID' })
    @ApiResponse({ status: 200, description: 'Analytics retrieved', type: PartnerAnalyticsDto })
    async getAnalytics(@Param('id') id: string) {
        const analytics = await this.partnersService.getAnalytics(id);
        return createSuccessResponse(analytics);
    }

    @Post('pending/:id/approve')
    @UseGuards(CookieAuthGuard)
    @Roles(Role.Admin, Role.Approver)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Approve partner', description: 'Approve a pending partner (Admin only)' })
    @ApiParam({ name: 'id', description: 'Pending partner ID' })
    @ApiResponse({ status: 200, description: 'Partner approved' })
    async approvePartner(@Param('id') id: string) {
        await this.partnersService.approvePartner(id);
        return createSuccessResponse(null, 'Partner approved successfully');
    }

    @Post('pending/:id/reject')
    @UseGuards(CookieAuthGuard)
    @Roles(Role.Admin, Role.Approver)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reject partner', description: 'Reject a pending partner (Admin only)' })
    @ApiParam({ name: 'id', description: 'Pending partner ID' })
    @ApiResponse({ status: 200, description: 'Partner rejected' })
    async rejectPartner(@Param('id') id: string) {
        await this.partnersService.rejectPartner(id);
        return createSuccessResponse(null, 'Partner rejected');
    }

    @Post('request')
    @UseGuards(CookieAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Request partner status', description: 'Regular user requests to become a partner' })
    @ApiResponse({ status: 201, description: 'Partner request submitted' })
    @ApiResponse({ status: 409, description: 'Request already pending' })
    async requestPartnerStatus(
        @Body() dto: { businessName: string; phone?: string; description?: string },
        @Req() req: Request,
    ) {
        const { email, uid, name }: { email: string; uid: string; name?: string } = (req as any).signedCookies.id;
        await this.partnersService.requestPartnerStatus(email, uid, name, dto);
        return createSuccessResponse(null, 'Partner request submitted successfully');
    }
}

