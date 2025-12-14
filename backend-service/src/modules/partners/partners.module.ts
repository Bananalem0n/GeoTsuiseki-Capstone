import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';
import { FirestoreStorageService } from 'src/services/firestore-storage.service';

@Module({
    controllers: [PartnersController],
    providers: [PartnersService, FirestoreStorageService],
    exports: [PartnersService],
})
export class PartnersModule { }
