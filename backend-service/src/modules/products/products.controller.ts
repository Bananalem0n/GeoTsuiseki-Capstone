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
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ProductsService } from './products.service';
import {
    CreateProductDto,
    UpdateProductDto,
    RateProductDto,
    ProductDto,
} from './dto';
import { PaginationDto, createSuccessResponse } from 'src/common/dto';
import { CookieAuthGuard } from 'src/auth.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from 'src/auth/guard/roles.enum';
import { idCookie } from 'src/auth/cookies.model';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @ApiOperation({ summary: 'List all products', description: 'Get paginated list of products' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'partnerId', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
    async findAll(
        @Query() pagination: PaginationDto,
        @Query('partnerId') partnerId?: string,
    ) {
        return this.productsService.findAll(pagination, partnerId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID', description: 'Get a single product by its ID' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product retrieved', type: ProductDto })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findOne(@Param('id') id: string) {
        const product = await this.productsService.findOne(id);
        return createSuccessResponse(product);
    }

    @Post()
    @UseGuards(CookieAuthGuard)
    @Roles(Role.Partner)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create product', description: 'Create a new product (Partner only)' })
    @ApiResponse({ status: 201, description: 'Product created', type: ProductDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 403, description: 'Not authorized' })
    async create(@Body() dto: CreateProductDto, @Req() req: Request) {
        const { businessName, uid }: idCookie = req.signedCookies.id;
        const product = await this.productsService.create(uid, businessName || '', dto);
        return createSuccessResponse(product, 'Product created successfully');
    }

    @Put(':id')
    @UseGuards(CookieAuthGuard)
    @Roles(Role.Partner, Role.Admin)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update product', description: 'Update an existing product' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product updated', type: ProductDto })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        const product = await this.productsService.update(id, dto);
        return createSuccessResponse(product, 'Product updated successfully');
    }

    @Delete(':id')
    @UseGuards(CookieAuthGuard)
    @Roles(Role.Partner, Role.Admin)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete product', description: 'Delete a product' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product deleted' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async delete(@Param('id') id: string) {
        await this.productsService.delete(id);
        return createSuccessResponse(null, 'Product deleted successfully');
    }

    @Post(':id/rate')
    @UseGuards(CookieAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Rate product', description: 'Rate a product (authenticated users)' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product rated successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async rateProduct(
        @Param('id') id: string,
        @Body() dto: RateProductDto,
        @Req() req: Request,
    ) {
        const { uid }: idCookie = req.signedCookies.id;
        dto.productId = id;
        await this.productsService.rateProduct(uid, dto);
        return createSuccessResponse(null, 'Product rated successfully');
    }

    @Get(':id/qr')
    @ApiOperation({ summary: 'Get product QR code', description: 'Get QR code for a product' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'QR code retrieved' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async getQrCode(@Param('id') id: string) {
        const product = await this.productsService.findOne(id);
        return createSuccessResponse({ qrCode: product.qrCode });
    }
}
