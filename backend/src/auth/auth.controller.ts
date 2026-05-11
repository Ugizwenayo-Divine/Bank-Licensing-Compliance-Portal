import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  Ip,
  Headers,
} from '@nestjs/common';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiHeader, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiHeader({ name: 'user-agent', required: false })
  @HttpCode(HttpStatus.OK)
  async login(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Body() dto: LoginDto,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user, {
      ipAddress,
      userAgent,
      actingUser: user,
    });
  }

  @Post('refresh')
  @ApiHeader({ name: 'user-agent', required: false })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @CurrentUser() user: User,
  ) {
    return this.authService.login(user, {
      ipAddress,
      userAgent,
      actingUser: user,
    });
  }
}
