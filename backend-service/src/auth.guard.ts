import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { admin } from './main';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionCookie = request.signedCookies?.session;
    const idCookie = request.signedCookies?.id;

    // Check if both cookies exist
    if (!sessionCookie || !idCookie) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      // Verify the session cookie
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true);

      if (decodedClaims.uid) {
        return true;
      }

      throw new UnauthorizedException('Invalid session');
    } catch (error) {
      Logger.error('Auth guard error:', error.message);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}

