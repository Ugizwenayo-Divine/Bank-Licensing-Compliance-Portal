import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

import { DEFAULT_PAGE_SIZE } from '../common/constants/pagination.constants';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole, User } from '../users/user.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from './application.entity';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  ReviewApplicationDto,
  RequestInfoDto,
  DecisionDto,
  SubmitApplicationDto,
} from './dto';

@ApiTags('applications')
@Controller('applications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiHeader({ name: 'user-agent', required: false })
  @Roles(UserRole.APPLICANT)
  async create(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Body() dto: CreateApplicationDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationsService.create(dto, user, {
      ipAddress,
      userAgent,
      actingUser: user,
    });
  }

  @Put(':id')
  @ApiHeader({ name: 'user-agent', required: false })
  @Roles(UserRole.APPLICANT)
  async update(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationsService.update(id, dto, user, {
      ipAddress,
      userAgent,
      actingUser: user,
    });
  }

  @Post(':id/submit')
  @ApiHeader({ name: 'user-agent', required: false })
  @Roles(UserRole.APPLICANT)
  @HttpCode(HttpStatus.OK)
  async submit(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Param('id') id: string,
    @Body() dto: SubmitApplicationDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationsService.submit(id, user, dto, {
      ipAddress,
      userAgent,
      actingUser: user,
    });
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query() pagination: PaginationQueryDto,
  ) {
    const page = pagination.page || 0;
    const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE;
    const [data, total] = await this.applicationsService.findAll(
      user,
      page,
      pageSize,
    );
    return {
      meta: { total, page, pageSize },
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.applicationsService.findOne(id, user);
  }

  @Post(':id/start-review')
  @ApiHeader({ name: 'user-agent', required: false })
  @Roles(UserRole.REVIEWER)
  @HttpCode(HttpStatus.OK)
  async startReview(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.applicationsService.startReview(id, user, {
      ipAddress,
      userAgent,
      actingUser: user,
    });
  }

  @Post(':id/request-info')
  @ApiHeader({ name: 'user-agent', required: false })
  @Roles(UserRole.REVIEWER)
  @HttpCode(HttpStatus.OK)
  async requestInfo(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Param('id') id: string,
    @Body() dto: RequestInfoDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationsService.requestAdditionalInfo(id, dto, user, {
      ipAddress,
      userAgent,
      actingUser: user,
    });
  }

  @Post(':id/complete-review')
  @ApiHeader({ name: 'user-agent', required: false })
  @Roles(UserRole.REVIEWER)
  @HttpCode(HttpStatus.OK)
  async completeReview(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationsService.completeReview(id, dto, user, {
      ipAddress,
      userAgent,
      actingUser: user,
    });
  }

  @Post(':id/approve')
  @ApiHeader({ name: 'user-agent', required: false })
  @Roles(UserRole.APPROVER)
  @HttpCode(HttpStatus.OK)
  async approve(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Param('id') id: string,
    @Body() dto: DecisionDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationsService.makeDecision(
      id,
      ApplicationStatus.APPROVED,
      dto,
      user,
      { ipAddress, userAgent, actingUser: user },
    );
  }

  @Post(':id/reject')
  @ApiHeader({ name: 'user-agent', required: false })
  @Roles(UserRole.APPROVER)
  @HttpCode(HttpStatus.OK)
  async reject(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Param('id') id: string,
    @Body() dto: DecisionDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationsService.makeDecision(
      id,
      ApplicationStatus.REJECTED,
      dto,
      user,
      { ipAddress, userAgent, actingUser: user },
    );
  }
}
