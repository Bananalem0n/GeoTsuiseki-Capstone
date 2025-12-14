import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Role } from './guard/roles.enum';

/**
 * Cookie data structure for authenticated users
 */
export class idCookie {
  @IsString()
  idToken: string;

  @IsString()
  uid: string;

  @IsEmail()
  email: string;

  /**
   * User role - can be Role enum or string from Firestore
   */
  role: Role | string;

  @IsOptional()
  @IsString()
  businessName?: string | null;
}

