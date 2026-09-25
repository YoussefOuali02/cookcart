import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  @MinLength(1)
  defaultUnit: string;

  @IsOptional()
  @IsNumber()
  caloriesPer100g?: number;

  @IsOptional()
  @IsNumber()
  proteinPer100g?: number;

  @IsOptional()
  @IsNumber()
  carbsPer100g?: number;

  @IsOptional()
  @IsNumber()
  fatPer100g?: number;

  @IsOptional()
  @IsString()
  storageInstructions?: string;
}
