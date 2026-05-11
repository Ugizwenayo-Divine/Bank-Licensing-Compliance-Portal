import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Request,
  BadRequestException,
  Ip,
  Headers,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';

import { MAX_FILE_SIZE } from '../common/constants/file.constants';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/user.entity';
import { DocumentsService } from './documents.service';

@ApiTags('applications')
@Controller('applications/:applicationId/documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiHeader({ name: 'user-agent', required: false })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Roles(UserRole.APPLICANT)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async upload(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Param('applicationId') applicationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('documentGroup') documentGroup: string | undefined,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Use multipart/form-data with field name "file".',
      );
    }

    return this.documentsService.upload(
      applicationId,
      file,
      user,
      { actingUser: user, ipAddress, userAgent },
      documentGroup,
    );
  }

  @Get()
  async findAll(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.findByApplication(applicationId, user);
  }
}

@ApiTags('documents')
@Controller('documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class DocumentDownloadController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get([':id/download'])
  async download(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { doc, stream } = await this.documentsService.getFileStream(id, user);

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(doc.originalName)}"`,
    );
    res.setHeader('Content-Length', doc.fileSize.toString());

    return new StreamableFile(stream);
  }
}
