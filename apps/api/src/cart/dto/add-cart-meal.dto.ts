import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddCartMealDto {
  @IsString()
  mealId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;
}
