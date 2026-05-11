import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReviewApplicationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  notes: string;
}
