import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  requestedInfo: string;
}
