import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class SubmitApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
