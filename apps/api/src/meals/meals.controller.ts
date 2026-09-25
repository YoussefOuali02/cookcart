import { Controller, Get, Param } from '@nestjs/common';
import { Meal } from '@prisma/client';
import { MealsService, MealWithIngredients } from './meals.service';

@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  findAll(): Promise<Meal[]> {
    return this.mealsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<MealWithIngredients> {
    return this.mealsService.findById(id);
  }
}
