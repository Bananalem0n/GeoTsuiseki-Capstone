import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No specific roles are required for this route.
    }

    const request = context.switchToHttp().getRequest();
    const idCookie = request.signedCookies.id;

    if (!idCookie || !idCookie.role) {
      return false; // User role information is not available in the cookie.
    }

    // Normalize user role to lowercase for case-insensitive comparison
    const userRole = idCookie.role.toLowerCase();

    // Check if the user has any of the required roles (case-insensitive)
    return requiredRoles.some((role) => userRole === role.toLowerCase());
  }
}

