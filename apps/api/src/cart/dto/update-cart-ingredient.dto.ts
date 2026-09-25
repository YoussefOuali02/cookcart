import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCartIngredientDto {
  @IsOptional()
  @IsBoolean()
  isRemovedByUser?: boolean;

  @IsOptional()
  @IsString()
  removalReason?: string;
}
