import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  Ip,
  Headers,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { DEFAULT_PAGE_SIZE } from '../common/constants/pagination.constants';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from './user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({ name: 'user-agent', required: false })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Body() dto: CreateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.create(dto, {
      ipAddress,
      userAgent,
      actingUser: user,
    });
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() pagination: PaginationQueryDto) {
    const page = pagination.page || 0;
    const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE;
    const [data, total] = await this.usersService.findAll(page, pageSize);
    return {
      meta: { total, page, pageSize },
      data,
    };
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return user;
  }
}
