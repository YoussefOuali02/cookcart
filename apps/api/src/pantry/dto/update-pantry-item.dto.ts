import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePantryItemDto } from './create-pantry-item.dto';

export class UpdatePantryItemDto extends PartialType(
  OmitType(CreatePantryItemDto, ['ingredientId'] as const),
) {}
