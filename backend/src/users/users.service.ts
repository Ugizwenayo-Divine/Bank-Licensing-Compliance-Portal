import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { DEFAULT_PAGE_SIZE } from '../common/constants/pagination.constants';
import { AuditAction } from '../audit/audit-log.entity';
import { SALT_ROUNDS } from '../common/constants/auth.constants';
import { AuditContext, AuditService } from '../audit/audit.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateUserDto, context: AuditContext): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.dataSource.transaction(async (manager) => {
      const user = this.userRepo.create({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        role: dto.role,
      });

      await this.auditService.log({
        recordId: user.id,
        action: AuditAction.USER_CREATED,
        stateBefore: null,
        stateAfter: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          role: dto.role,
        },
        context,
        manager,
      });

      return this.userRepo.save(user);
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findAll(
    page = 1,
    paseSize = DEFAULT_PAGE_SIZE,
  ): Promise<[User[], number]> {
    return this.userRepo.findAndCount({
      order: { createdAt: 'ASC' },
      skip: paseSize * (page > 0 ? page - 1 : 0),
      take: paseSize,
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
