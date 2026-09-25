import {
  IsBoolean,
  IsISO8601,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePantryItemDto {
  @IsString()
  ingredientId: string;

  @IsPositive()
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsISO8601()
  expiryDate?: string;

  @IsOptional()
  @IsBoolean()
  alwaysAvailable?: boolean;
}
