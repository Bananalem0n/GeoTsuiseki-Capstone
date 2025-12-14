import { Injectable, NotFoundException } from '@nestjs/common';
import { admin } from 'src/main';
import { COLLECTIONS } from 'src/constants';
import { PartnerDto, UpdatePartnerDto, EmployeeDto, PartnerAnalyticsDto, PendingPartnerDto } from './dto';
import { PaginationDto, createPaginatedResponse, PaginatedResponse } from 'src/common/dto';
import { FirestoreStorageService } from 'src/services/firestore-storage.service';

/**
 * Partners service
 * Handles partner management, approval, and analytics
 */
@Injectable()
export class PartnersService {
    private readonly verifiedCollection = COLLECTIONS.VERIFIED_PARTNER;
    private readonly unverifiedCollection = COLLECTIONS.UNVERIFIED_PARTNER;
    private readonly productsCollection = 'products';
    private readonly employeesCollection = 'employees';

    constructor(private readonly storageService: FirestoreStorageService) { }

    /**
     * Get all verified partners with pagination
     */
    async findAll(pagination: PaginationDto): Promise<PaginatedResponse<PartnerDto>> {
        try {
            const snapshot = await admin
                .firestore()
                .collection(this.verifiedCollection)
                .get();

            let partners: PartnerDto[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    businessName: data.businessName || doc.id,
                    email: data.email,
                    nib: data.nib,
                    telephone: data.telephone,
                    description: data.deskripsi,
                    logo: data.logo,
                    status: 'verified' as const,
                    createdAt: data.createdAt,
                };
            });

            // Apply search
            if (pagination.search) {
                const searchLower = pagination.search.toLowerCase();
                partners = partners.filter((p) =>
                    p.businessName.toLowerCase().includes(searchLower),
                );
            }

            const total = partners.length;
            const page = pagination.page || 1;
            const limit = pagination.limit || 10;
            const startIndex = (page - 1) * limit;
            const paginatedPartners = partners.slice(startIndex, startIndex + limit);

            return createPaginatedResponse(paginatedPartners, total, page, limit);
        } catch (error) {
            console.error('Error fetching partners:', error.message);
            throw error;
        }
    }

    /**
     * Get partner by ID
     */
    async findOne(id: string): Promise<PartnerDto> {
        try {
            const doc = await admin
                .firestore()
                .collection(this.verifiedCollection)
                .doc(id)
                .get();

            if (!doc.exists) {
                throw new NotFoundException('Partner not found');
            }

            const data = doc.data();

            // Get product count
            const productsSnapshot = await admin
                .firestore()
                .collection(this.verifiedCollection)
                .doc(id)
                .collection(this.productsCollection)
                .get();

            // Get employee count
            const employeesSnapshot = await admin
                .firestore()
                .collection(this.verifiedCollection)
                .doc(id)
                .collection(this.employeesCollection)
                .get();

            return {
                id: doc.id,
                businessName: data?.businessName || doc.id,
                email: data?.email,
                nib: data?.nib,
                telephone: data?.telephone,
                description: data?.deskripsi,
                logo: data?.logo,
                status: 'verified',
                productCount: productsSnapshot.size,
                employeeCount: employeesSnapshot.size,
                createdAt: data?.createdAt,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error fetching partner:', error.message);
            throw error;
        }
    }

    /**
     * Update partner profile
     */
    async update(id: string, dto: UpdatePartnerDto): Promise<PartnerDto> {
        try {
            const docRef = admin.firestore().collection(this.verifiedCollection).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new NotFoundException('Partner not found');
            }

            await docRef.update({
                ...dto,
                deskripsi: dto.description,
                updatedAt: new Date().toISOString(),
            });

            return this.findOne(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error updating partner:', error.message);
            throw error;
        }
    }

    /**
     * Get partner employees
     */
    async getEmployees(partnerId: string): Promise<EmployeeDto[]> {
        try {
            const snapshot = await admin
                .firestore()
                .collection(this.verifiedCollection)
                .doc(partnerId)
                .collection(this.employeesCollection)
                .get();

            return snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    name: data.name,
                    role: data.role,
                    link: data.link,
                    bio: data.bio,
                    image: data.image,
                };
            });
        } catch (error) {
            console.error('Error fetching employees:', error.message);
            throw error;
        }
    }

    /**
     * Get pending partners (for approval)
     */
    async findPending(): Promise<PendingPartnerDto[]> {
        try {
            const snapshot = await admin
                .firestore()
                .collection(this.unverifiedCollection)
                .get();

            return snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    businessName: data.businessName || doc.id,
                    ownerName: data.username,
                    email: data.email,
                    nib: data.nib,
                    telephone: data.telephone,
                    description: data.deskripsi,
                    logo: data.logo,
                    status: 'pending' as const,
                    createdAt: data.createdAt,
                };
            });
        } catch (error) {
            console.error('Error fetching pending partners:', error.message);
            throw error;
        }
    }

    /**
     * Approve a pending partner
     */
    async approvePartner(id: string): Promise<void> {
        try {
            const sourceRef = admin.firestore().collection(this.unverifiedCollection).doc(id);
            const doc = await sourceRef.get();

            if (!doc.exists) {
                throw new NotFoundException('Pending partner not found');
            }

            const data = doc.data();

            // Move to verified collection with explicit businessName
            const businessName = data.businessName || id;
            await admin
                .firestore()
                .collection(this.verifiedCollection)
                .doc(id)
                .set({
                    ...data,
                    businessName: businessName,
                    approvedAt: new Date().toISOString(),
                });

            // Enable user account and create user record for login
            if (data?.uuid && data?.email) {
                await admin.auth().updateUser(data.uuid, { disabled: false });

                // Create user record in users collection so they can login
                await admin.firestore().collection(COLLECTIONS.USERS).doc(data.email).set({
                    email: data.email,
                    name: data.username || businessName,
                    roles: 'partner',
                    uuid: data.uuid,
                    businessName: businessName,
                    createdAt: new Date().toISOString(),
                });
            }

            // Delete from unverified
            await sourceRef.delete();
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error approving partner:', error.message);
            throw error;
        }
    }

    /**
     * Reject a pending partner
     */
    async rejectPartner(id: string): Promise<void> {
        try {
            const docRef = admin.firestore().collection(this.unverifiedCollection).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new NotFoundException('Pending partner not found');
            }

            // Delete from unverified
            await docRef.delete();
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error rejecting partner:', error.message);
            throw error;
        }
    }

    /**
     * Get partner analytics
     */
    async getAnalytics(partnerId: string): Promise<PartnerAnalyticsDto> {
        try {
            const partnerRef = admin.firestore().collection(this.verifiedCollection).doc(partnerId);
            const partnerDoc = await partnerRef.get();

            if (!partnerDoc.exists) {
                throw new NotFoundException('Partner not found');
            }

            // Get products with stats
            const productsSnapshot = await partnerRef.collection(this.productsCollection).get();
            const employeesSnapshot = await partnerRef.collection(this.employeesCollection).get();

            let totalScans = 0;
            let totalRating = 0;
            let ratingCount = 0;
            const topProducts: { id: string; name: string; scans: number }[] = [];

            productsSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                const scans = data.totalScans || 0;
                totalScans += scans;

                if (data.averageRating) {
                    totalRating += data.averageRating;
                    ratingCount++;
                }

                topProducts.push({
                    id: doc.id,
                    name: data.name,
                    scans,
                });
            });

            // Sort by scans and take top 5
            topProducts.sort((a, b) => b.scans - a.scans);

            return {
                totalProducts: productsSnapshot.size,
                totalScans,
                totalEmployees: employeesSnapshot.size,
                averageRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
                topProducts: topProducts.slice(0, 5),
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error fetching analytics:', error.message);
            throw error;
        }
    }

    /**
     * Request partner status (for regular users)
     */
    async requestPartnerStatus(
        email: string,
        uid: string,
        name: string | undefined,
        dto: { businessName: string; phone?: string; description?: string },
    ): Promise<void> {
        try {
            // Check if already a partner request exists
            const existingRequest = await admin
                .firestore()
                .collection(this.unverifiedCollection)
                .doc(dto.businessName)
                .get();

            if (existingRequest.exists) {
                throw new Error('Partner request already pending');
            }

            // Check if already a verified partner
            const existingPartner = await admin
                .firestore()
                .collection(this.verifiedCollection)
                .doc(dto.businessName)
                .get();

            if (existingPartner.exists) {
                throw new Error('This business is already a verified partner');
            }

            // Create partner request in unverified collection
            await admin
                .firestore()
                .collection(this.unverifiedCollection)
                .doc(dto.businessName)
                .set({
                    businessName: dto.businessName,
                    email: email,
                    username: name || email,
                    uuid: uid,
                    telephone: dto.phone || null,
                    deskripsi: dto.description || null,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                });
        } catch (error) {
            console.error('Error requesting partner status:', error.message);
            throw error;
        }
    }
}

