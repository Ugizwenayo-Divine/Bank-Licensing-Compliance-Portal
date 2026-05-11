import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DEFAULT_PAGE_SIZE } from '../common/constants/pagination.constants';
import { AuditLog, AuditAction } from './audit-log.entity';
import { User } from '../users/user.entity';

export interface AuditContext {
  actingUser: User | null;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateAuditEntryDto {
  recordId: string;
  action: AuditAction;
  stateBefore?: Record<string, any> | null;
  stateAfter?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  context: AuditContext;
  manager?: EntityManager;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditEntryDto): Promise<AuditLog> {
    const repo = dto.manager
      ? dto.manager.getRepository(AuditLog)
      : this.auditRepo;

    const entry = repo.create({
      recordId: dto.recordId,
      actingUserId: dto.context.actingUser?.id ?? null,
      actingUserEmail: dto.context.actingUser?.email ?? null,
      actingUserRole: dto.context.actingUser?.role ?? null,
      action: dto.action,
      stateBefore: dto.stateBefore ?? null,
      stateAfter: dto.stateAfter ?? null,
      metadata: dto.metadata ?? null,
      ipAddress: dto.context.ipAddress ?? null,
      userAgent: dto.context.userAgent ?? null,
    });

    return repo.save(entry);
  }

  async findByApplication(recordId: string): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { recordId },
      order: { createdAt: 'ASC' },
    });
  }

  async findAll(
    page = 1,
    paseSize = DEFAULT_PAGE_SIZE,
  ): Promise<[AuditLog[], number]> {
    return this.auditRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: paseSize * (page > 0 ? page - 1 : 0),
      take: paseSize,
    });
  }
}
