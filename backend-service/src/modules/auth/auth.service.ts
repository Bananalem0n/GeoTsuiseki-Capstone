import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { firebase } from 'src/firebase.config';
import { admin, duration } from 'src/main';
import { COLLECTIONS } from 'src/constants';
import { LoginDto, RegisterUserDto, LoginResponseDto, CurrentUserDto } from './dto';

/**
 * Authentication service
 * Handles login, registration, logout, and password reset
 */
@Injectable()
export class AuthService {
    private readonly usersCollection = COLLECTIONS.USERS;

    /**
     * Authenticate user with email and password
     */
    async login(dto: LoginDto): Promise<{ user: LoginResponseDto; sessionCookie: string }> {
        const auth = getAuth(firebase);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                dto.email,
                dto.password,
            );

            const idToken = await userCredential.user.getIdToken(true);
            const { uid } = userCredential.user;

            // Get user data from Firestore
            const userDoc = await admin
                .firestore()
                .collection(this.usersCollection)
                .doc(dto.email)
                .get();

            if (!userDoc.exists) {
                throw new UnauthorizedException('User not found in database');
            }

            const userData = userDoc.data();
            const sessionCookie = await admin
                .auth()
                .createSessionCookie(idToken, { expiresIn: duration });

            const user: LoginResponseDto = {
                uid,
                email: dto.email,
                role: userData?.roles?.toLowerCase() || 'user',
                businessName: userData?.businessName,
            };

            return { user, sessionCookie };
        } catch (error) {
            console.error('Login error:', error.message);
            throw new UnauthorizedException('Invalid email or password');
        }
    }

    /**
     * Register a new user (mobile registration)
     */
    async registerUser(dto: RegisterUserDto): Promise<{ uid: string; email: string }> {
        try {
            // Check if user already exists
            const existingUser = await admin
                .firestore()
                .collection(this.usersCollection)
                .doc(dto.email)
                .get();

            if (existingUser.exists) {
                throw new ConflictException('User with this email already exists');
            }

            // Create Firebase Auth user
            const user = await admin.auth().createUser({
                email: dto.email,
                password: dto.password,
                displayName: dto.name,
                disabled: false,
            });

            // Create Firestore user document
            await admin.firestore().collection(this.usersCollection).doc(dto.email).set({
                email: dto.email,
                name: dto.name,
                phone: dto.phone || null,
                roles: 'user',
                uuid: user.uid,
                createdAt: new Date().toISOString(),
            });

            return { uid: user.uid, email: dto.email };
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            console.error('Registration error:', error.message);
            throw new Error('Failed to register user');
        }
    }

    /**
     * Logout user by revoking refresh tokens
     */
    async logout(uid: string): Promise<void> {
        try {
            await admin.auth().revokeRefreshTokens(uid);
        } catch (error) {
            console.error('Logout error:', error.message);
            throw new Error('Failed to logout');
        }
    }

    /**
     * Send password reset email
     */
    async requestPasswordReset(email: string): Promise<void> {
        const auth = getAuth(firebase);
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset error:', error.message);
            // Don't reveal if email exists or not
            throw new Error('Failed to send password reset email');
        }
    }

    /**
     * Get current user data from session
     */
    async getCurrentUser(email: string): Promise<CurrentUserDto> {
        try {
            const userDoc = await admin
                .firestore()
                .collection(this.usersCollection)
                .doc(email)
                .get();

            if (!userDoc.exists) {
                throw new UnauthorizedException('User not found');
            }

            const data = userDoc.data();
            return {
                uid: data?.uuid,
                email: data?.email,
                name: data?.name,
                role: data?.roles?.toLowerCase() || 'user',
                businessName: data?.businessName,
            };
        } catch (error) {
            console.error('Get current user error:', error.message);
            throw new UnauthorizedException('Failed to get user data');
        }
    }
}
