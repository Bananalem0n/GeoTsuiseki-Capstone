import { Module, Controller, Get } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guard/roles.guard';

// API modules
import { AuthModule } from './modules/auth';
import { ProductsModule } from './modules/products';
import { PartnersModule } from './modules/partners';
import { UsersModule } from './modules/users';

// Shared services
import { FirestoreStorageService } from './services/firestore-storage.service';
import { QrCodeService } from './services/qrCode.service';
import { StorageService } from './services/storage.service';

/**
 * Health check controller
 */
@Controller()
export class HealthController {
  @Get()
  getRoot() {
    return { status: 'ok', message: 'GeoTsuiseki API v1' };
  }

  @Get('health')
  getHealth() {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    PartnersModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [
    // Shared services
    FirestoreStorageService,
    QrCodeService,
    StorageService,
    // Global guards
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }


