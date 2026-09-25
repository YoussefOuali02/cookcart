import { Controller, Get } from '@nestjs/common';
import { Ingredient } from '@prisma/client';
import { IngredientsService } from './ingredients.service';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  findAll(): Promise<Ingredient[]> {
    return this.ingredientsService.findAll();
  }
}
