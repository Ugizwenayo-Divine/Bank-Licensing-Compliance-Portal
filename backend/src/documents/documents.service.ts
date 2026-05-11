import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as path from 'path';
import type { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { MAX_FILE_SIZE } from '../common/constants/file.constants';
import {
  Application,
  ApplicationStatus,
} from '../applications/application.entity';
import { User, UserRole } from '../users/user.entity';
import { AuditService, AuditContext } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';
import { FILE_STORAGE } from '../storage/file-storage.interface';
import type { FileStorageService } from '../storage/file-storage.interface';
import { Document } from './document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly docRepo: Repository<Document>,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorageService,
  ) {}

  async upload(
    applicationId: string,
    file: Express.Multer.File,
    user: User,
    context: AuditContext,
    documentGroup?: string,
  ): Promise<Document> {
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size ${file.size} bytes exceeds the 5 MB limit`,
      );
    }

    const application = await this.appRepo.findOne({
      where: { id: applicationId },
    });
    if (!application)
      throw new NotFoundException(`Application ${applicationId} not found`);

    if (
      user.role === UserRole.APPLICANT &&
      application.applicantId !== user.id
    ) {
      throw new ForbiddenException('Access denied');
    }

    const uploadableStatuses: ApplicationStatus[] = [
      ApplicationStatus.DRAFT,
      ApplicationStatus.ADDITIONAL_INFO_REQUESTED,
    ];
    if (!uploadableStatuses.includes(application.status)) {
      throw new BadRequestException(
        `Documents cannot be uploaded when the application is in status: ${application.status}`,
      );
    }

    const group = documentGroup ?? uuidv4();

    const storedName = `${uuidv4()}${path.extname(file.originalname)}`;
    await this.storage.save(storedName, file.buffer);

    return this.dataSource.transaction(async (manager) => {
      const docRepo = manager.getRepository(Document);

      const existingDocs = await docRepo.find({
        where: { applicationId, documentGroup: group },
        order: { version: 'DESC' },
      });

      const nextVersion =
        existingDocs.length > 0 ? existingDocs[0].version + 1 : 1;

      if (existingDocs.length > 0) {
        await docRepo.update(
          { applicationId, documentGroup: group },
          { isSuperseded: true },
        );
      }

      const doc = docRepo.create({
        originalName: file.originalname,
        storedName,
        mimeType: file.mimetype,
        fileSize: file.size,
        applicationId,
        uploaderId: user.id,
        documentGroup: group,
        version: nextVersion,
        isSuperseded: false,
      });

      const saved = await docRepo.save(doc);

      await this.auditService.log({
        recordId: applicationId,
        action: AuditAction.DOCUMENT_UPLOADED,
        stateBefore: null,
        stateAfter: null,
        metadata: {
          documentId: saved.id,
          originalName: file.originalname,
          fileSize: file.size,
          version: nextVersion,
          documentGroup: group,
        },
        context,
        manager,
      });

      return saved;
    });
  }

  async findByApplication(
    applicationId: string,
    user: User,
  ): Promise<Document[]> {
    const application = await this.appRepo.findOne({
      where: { id: applicationId },
    });
    if (!application)
      throw new NotFoundException(`Application ${applicationId} not found`);

    if (
      user.role === UserRole.APPLICANT &&
      application.applicantId !== user.id
    ) {
      throw new ForbiddenException('Access denied');
    }

    const docs = await this.docRepo.find({
      where: { applicationId },
      relations: ['uploader'],
      order: { documentGroup: 'ASC', version: 'DESC' },
    });

    return docs;
  }

  async getFileStream(
    documentId: string,
    user: User,
  ): Promise<{ doc: Document; stream: Readable }> {
    const doc = await this.docRepo.findOne({
      where: { id: documentId },
      relations: ['application'],
    });

    if (!doc) throw new NotFoundException(`Document ${documentId} not found`);

    if (
      user.role === UserRole.APPLICANT &&
      doc.application?.applicantId !== user.id
    ) {
      throw new ForbiddenException('Access denied');
    }

    const stream = await this.storage.read(doc.storedName);
    return { doc, stream };
  }
}
