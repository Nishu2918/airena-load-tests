import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  IsIn,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HackathonCategory } from '../../common/constants/enums';

class RequirementsDto {
  @IsString()
  description: string;

  @IsString({ each: true })
  @IsOptional()
  technologies?: string[];

  @IsString({ each: true })
  @IsOptional()
  deliverables?: string[];

  @IsNumber()
  @IsOptional()
  minScore?: number;
}

export class CreateHackathonDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsIn(Object.values(HackathonCategory))
  category: string;

  @IsDateString()
  registrationStart: string;

  @IsDateString()
  registrationEnd: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsDateString()
  submissionDeadline: string;

  @IsNumber()
  @IsOptional()
  prizeAmount?: number;

  @IsString()
  @IsOptional()
  prizeCurrency?: string;

  @IsNumber()
  @IsOptional()
  registrationFee?: number;

  @ValidateNested()
  @Type(() => RequirementsDto)
  requirements: RequirementsDto;

  @IsString()
  rules: string;

  @IsString()
  guidelines: string;

  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @IsString()
  @IsOptional()
  logoImageUrl?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minTeamSize?: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxTeamSize?: number;

  @IsBoolean()
  @IsOptional()
  allowIndividual?: boolean;
}

