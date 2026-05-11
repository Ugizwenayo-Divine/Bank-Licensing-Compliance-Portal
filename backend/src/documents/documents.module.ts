import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { Application } from '../applications/application.entity';
import { DocumentsService } from './documents.service';
import {
  DocumentsController,
  DocumentDownloadController,
} from './documents.controller';
import { AuditModule } from '../audit/audit.module';
import { FILE_STORAGE } from '../storage/file-storage.interface';
import { LocalFileStorageService } from '../storage/local-file-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Application]), AuditModule],
  providers: [
    DocumentsService,
    {
      provide: FILE_STORAGE,
      useClass: LocalFileStorageService,
    },
  ],
  controllers: [DocumentsController, DocumentDownloadController],
})
export class DocumentsModule {}
