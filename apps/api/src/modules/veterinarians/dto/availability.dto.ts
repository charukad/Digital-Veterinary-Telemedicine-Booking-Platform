import {
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreateAvailabilitySlotDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

export class UpdateAvailabilitySlotDto {
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  @IsOptional()
  startTime?: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  @IsOptional()
  endTime?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

export class BulkAvailabilityDto {
  slots: CreateAvailabilitySlotDto[];
}
