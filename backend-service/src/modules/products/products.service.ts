import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { admin } from 'src/main';
import { COLLECTIONS } from 'src/constants';
import { CreateProductDto, UpdateProductDto, ProductDto, RateProductDto } from './dto';
import { PaginationDto, createPaginatedResponse, PaginatedResponse } from 'src/common/dto';

/**
 * Products service
 * Handles product CRUD operations
 */
@Injectable()
export class ProductsService {
    private readonly productsCollection = COLLECTIONS.PRODUCTS;
    private readonly partnersCollection = COLLECTIONS.VERIFIED_PARTNER;

    /**
     * Get all products with pagination and filtering
     */
    async findAll(
        pagination: PaginationDto,
        partnerId?: string,
    ): Promise<PaginatedResponse<ProductDto>> {
        try {
            let query = admin.firestore().collection(this.productsCollection);

            // Get all products and apply filtering
            const snapshot = await query.get();
            let products: ProductDto[] = [];

            for (const doc of snapshot.docs) {
                const data = doc.data();

                // If filtering by partner, skip non-matching
                if (partnerId && data.partnerId !== partnerId) {
                    continue;
                }

                products.push({
                    id: doc.id,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    tags: data.tags,
                    partnerId: data.partnerId,
                    partnerName: data.partnerName,
                    averageRating: data.averageRating,
                    totalScans: data.totalScans,
                    images: data.images,
                });
            }

            // Apply search filter
            if (pagination.search) {
                const searchLower = pagination.search.toLowerCase();
                products = products.filter(
                    (p) =>
                        p.name.toLowerCase().includes(searchLower) ||
                        p.description?.toLowerCase().includes(searchLower),
                );
            }

            // Apply pagination
            const total = products.length;
            const page = pagination.page || 1;
            const limit = pagination.limit || 10;
            const startIndex = (page - 1) * limit;
            const paginatedProducts = products.slice(startIndex, startIndex + limit);

            return createPaginatedResponse(paginatedProducts, total, page, limit);
        } catch (error) {
            console.error('Error fetching products:', error.message);
            throw error;
        }
    }

    /**
     * Get product by ID
     */
    async findOne(id: string): Promise<ProductDto> {
        try {
            const doc = await admin
                .firestore()
                .collection(this.productsCollection)
                .doc(id)
                .get();

            if (!doc.exists) {
                throw new NotFoundException('Product not found');
            }

            const data = doc.data();
            return {
                id: doc.id,
                name: data?.name,
                description: data?.description,
                price: data?.price,
                stock: data?.stock,
                tags: data?.tags,
                partnerId: data?.partnerId,
                partnerName: data?.partnerName,
                averageRating: data?.averageRating,
                totalScans: data?.totalScans,
                images: data?.images,
                qrCode: data?.qrcodeURL,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error fetching product:', error.message);
            throw error;
        }
    }

    /**
     * Create a new product
     */
    async create(
        partnerId: string,
        partnerName: string,
        dto: CreateProductDto,
    ): Promise<ProductDto> {
        try {
            const productData = {
                ...dto,
                partnerId,
                partnerName,
                averageRating: 0,
                totalScans: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const docRef = await admin
                .firestore()
                .collection(this.productsCollection)
                .add(productData);

            return {
                id: docRef.id,
                ...dto,
                partnerId,
                partnerName,
                averageRating: 0,
                totalScans: 0,
            };
        } catch (error) {
            console.error('Error creating product:', error.message);
            throw error;
        }
    }

    /**
     * Update a product
     */
    async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
        try {
            const docRef = admin.firestore().collection(this.productsCollection).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new NotFoundException('Product not found');
            }

            const updateData = {
                ...dto,
                updatedAt: new Date().toISOString(),
            };

            await docRef.update(updateData);

            const updated = await docRef.get();
            const data = updated.data();

            return {
                id,
                name: data?.name,
                description: data?.description,
                price: data?.price,
                stock: data?.stock,
                tags: data?.tags,
                partnerId: data?.partnerId,
                partnerName: data?.partnerName,
                averageRating: data?.averageRating,
                totalScans: data?.totalScans,
                images: data?.images,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error updating product:', error.message);
            throw error;
        }
    }

    /**
     * Delete a product
     */
    async delete(id: string): Promise<void> {
        try {
            const docRef = admin.firestore().collection(this.productsCollection).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new NotFoundException('Product not found');
            }

            await docRef.delete();
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error deleting product:', error.message);
            throw error;
        }
    }

    /**
     * Rate a product
     */
    async rateProduct(userId: string, dto: RateProductDto): Promise<void> {
        try {
            const docRef = admin.firestore().collection(this.productsCollection).doc(dto.productId);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new NotFoundException('Product not found');
            }

            const data = doc.data();
            const currentRating = data?.averageRating || 0;
            const ratingCount = data?.ratingCount || 0;

            // Calculate new average
            const newRatingCount = ratingCount + 1;
            const newAverageRating = ((currentRating * ratingCount) + dto.rating) / newRatingCount;

            await docRef.update({
                averageRating: Math.round(newAverageRating * 10) / 10,
                ratingCount: newRatingCount,
                updatedAt: new Date().toISOString(),
            });

            // Store individual rating
            await admin
                .firestore()
                .collection(this.productsCollection)
                .doc(dto.productId)
                .collection('ratings')
                .add({
                    userId,
                    rating: dto.rating,
                    comment: dto.comment,
                    createdAt: new Date().toISOString(),
                });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error rating product:', error.message);
            throw error;
        }
    }

    /**
     * Get products by partner
     */
    async findByPartner(partnerId: string): Promise<ProductDto[]> {
        try {
            const snapshot = await admin
                .firestore()
                .collection(this.partnersCollection)
                .doc(partnerId)
                .collection('products')
                .get();

            return snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    tags: data.tags,
                    partnerId,
                    images: data.images,
                };
            });
        } catch (error) {
            console.error('Error fetching partner products:', error.message);
            throw error;
        }
    }
}
