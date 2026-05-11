import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DEFAULT_PAGE_SIZE } from '../common/constants/pagination.constants';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '../users/user.entity';
import { AuditService } from './audit.service';

@ApiTags('audit')
@Controller('audit')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.APPROVER)
  async findAll(@Query() pagination: PaginationQueryDto) {
    const page = pagination.page || 0;
    const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE;
    const [data, total] = await this.auditService.findAll(page, pageSize);
    return {
      meta: { total, page, pageSize },
      data,
    };
  }

  @Get('application/:applicationId')
  @Roles(UserRole.ADMIN, UserRole.APPROVER, UserRole.REVIEWER)
  async findByApplication(@Param('applicationId') applicationId: string) {
    return this.auditService.findByApplication(applicationId);
  }
}
