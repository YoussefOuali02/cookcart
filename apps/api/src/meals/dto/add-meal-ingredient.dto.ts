import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class AddMealIngredientDto {
  @IsString()
  ingredientId: string;

  @IsPositive()
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  cookingStep?: number;
}
