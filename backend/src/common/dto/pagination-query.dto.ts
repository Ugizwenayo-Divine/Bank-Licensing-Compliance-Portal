import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination.constants';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @ValidateIf((o, v) => !!v)
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items to fetch per page',
    example: 10,
  })
  @ValidateIf((o, v) => !!v)
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @Min(1)
  @Max(DEFAULT_PAGE_SIZE)
  pageSize?: number;
}
