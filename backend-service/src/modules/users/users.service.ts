import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { admin } from 'src/main';
import { COLLECTIONS } from 'src/constants';
import { UserDto, UpdateUserDto, UpdateRoleDto, CreateUserDto } from './dto';
import { PaginationDto, createPaginatedResponse, PaginatedResponse } from 'src/common/dto';

/**
 * Users service
 * Handles user management (admin operations)
 */
@Injectable()
export class UsersService {
    private readonly usersCollection = COLLECTIONS.USERS;

    /**
     * Get all users with pagination
     */
    async findAll(pagination: PaginationDto): Promise<PaginatedResponse<UserDto>> {
        try {
            const snapshot = await admin.firestore().collection(this.usersCollection).get();

            let users: UserDto[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    uid: data.uuid || data.uid,
                    email: data.email || doc.id,
                    name: data.name,
                    role: data.roles?.toLowerCase() || 'user',
                    businessName: data.businessName,
                    phone: data.phone,
                    createdAt: data.createdAt,
                };
            });

            // Apply search
            if (pagination.search) {
                const searchLower = pagination.search.toLowerCase();
                users = users.filter(
                    (u) =>
                        u.email.toLowerCase().includes(searchLower) ||
                        u.name?.toLowerCase().includes(searchLower),
                );
            }

            const total = users.length;
            const page = pagination.page || 1;
            const limit = pagination.limit || 10;
            const startIndex = (page - 1) * limit;
            const paginatedUsers = users.slice(startIndex, startIndex + limit);

            return createPaginatedResponse(paginatedUsers, total, page, limit);
        } catch (error) {
            console.error('Error fetching users:', error.message);
            throw error;
        }
    }

    /**
     * Get user by ID (email)
     */
    async findOne(email: string): Promise<UserDto> {
        try {
            const doc = await admin.firestore().collection(this.usersCollection).doc(email).get();

            if (!doc.exists) {
                throw new NotFoundException('User not found');
            }

            const data = doc.data();
            return {
                uid: data?.uuid || data?.uid,
                email: data?.email || doc.id,
                name: data?.name,
                role: data?.roles?.toLowerCase() || 'user',
                businessName: data?.businessName,
                phone: data?.phone,
                createdAt: data?.createdAt,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error fetching user:', error.message);
            throw error;
        }
    }

    /**
     * Create a new user (admin action)
     */
    async create(dto: CreateUserDto): Promise<UserDto> {
        try {
            // Check if user exists
            const existingDoc = await admin
                .firestore()
                .collection(this.usersCollection)
                .doc(dto.email)
                .get();

            if (existingDoc.exists) {
                throw new ConflictException('User with this email already exists');
            }

            // Create Firebase Auth user
            const authUser = await admin.auth().createUser({
                email: dto.email,
                password: dto.password,
                displayName: dto.name,
                disabled: false,
            });

            // Create Firestore user document
            const userData = {
                email: dto.email,
                name: dto.name,
                roles: dto.role.charAt(0).toUpperCase() + dto.role.slice(1), // Capitalize
                uuid: authUser.uid,
                createdAt: new Date().toISOString(),
            };

            await admin.firestore().collection(this.usersCollection).doc(dto.email).set(userData);

            // If role is partner, also create entry in verified_partners collection
            if (dto.role.toLowerCase() === 'partner') {
                const businessName = dto.name || dto.email.split('@')[0];
                await admin.firestore().collection(COLLECTIONS.VERIFIED_PARTNER).doc(businessName).set({
                    businessName: businessName,
                    email: dto.email,
                    username: dto.name,
                    uuid: authUser.uid,
                    status: 'verified',
                    approvedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                });
            }

            return {
                uid: authUser.uid,
                email: dto.email,
                name: dto.name,
                role: dto.role,
            };
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            console.error('Error creating user:', error.message);
            throw error;
        }
    }

    /**
     * Update user
     */
    async update(email: string, dto: UpdateUserDto): Promise<UserDto> {
        try {
            const docRef = admin.firestore().collection(this.usersCollection).doc(email);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new NotFoundException('User not found');
            }

            await docRef.update({
                ...dto,
                updatedAt: new Date().toISOString(),
            });

            return this.findOne(email);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error updating user:', error.message);
            throw error;
        }
    }

    /**
     * Update user role
     */
    async updateRole(email: string, dto: UpdateRoleDto): Promise<UserDto> {
        try {
            const docRef = admin.firestore().collection(this.usersCollection).doc(email);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new NotFoundException('User not found');
            }

            const data = doc.data();
            const oldRole = data?.roles?.toLowerCase() || 'user';
            const newRole = dto.role.toLowerCase();

            // Capitalize role for storage
            const capitalizedRole = dto.role.charAt(0).toUpperCase() + dto.role.slice(1);

            await docRef.update({
                roles: capitalizedRole,
                updatedAt: new Date().toISOString(),
            });

            // Handle partner collection sync
            if (oldRole !== 'partner' && newRole === 'partner') {
                // Adding partner role - create partner record
                const businessName = data?.name || email.split('@')[0];
                await admin.firestore().collection(COLLECTIONS.VERIFIED_PARTNER).doc(businessName).set({
                    businessName: businessName,
                    email: email,
                    username: data?.name,
                    uuid: data?.uuid,
                    status: 'verified',
                    approvedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                });
            } else if (oldRole === 'partner' && newRole !== 'partner') {
                // Removing partner role - delete partner record
                const businessName = data?.businessName || data?.name || email.split('@')[0];
                try {
                    await admin.firestore().collection(COLLECTIONS.VERIFIED_PARTNER).doc(businessName).delete();
                } catch {
                    // Partner record might not exist
                }
            }

            return this.findOne(email);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error updating user role:', error.message);
            throw error;
        }
    }

    /**
     * Delete user
     */
    async delete(email: string): Promise<void> {
        try {
            const docRef = admin.firestore().collection(this.usersCollection).doc(email);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new NotFoundException('User not found');
            }

            const data = doc.data();

            // Delete from Firebase Auth
            if (data?.uuid) {
                try {
                    await admin.auth().deleteUser(data.uuid);
                } catch (authError) {
                    console.error('Error deleting auth user:', authError.message);
                }
            }

            // Delete from Firestore
            await docRef.delete();
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error deleting user:', error.message);
            throw error;
        }
    }
}
