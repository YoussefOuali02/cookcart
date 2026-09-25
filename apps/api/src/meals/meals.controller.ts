import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Meal } from '@prisma/client';
import { MealsService, MealWithIngredients } from './meals.service';
import { MealKitPreview } from './interfaces/meal-kit-preview.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SafeUser } from '../users/user.serializer';

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

  @UseGuards(JwtAuthGuard)
  @Post(':id/preview-kit')
  previewKit(
    @Param('id') id: string,
    @CurrentUser() user: SafeUser,
  ): Promise<MealKitPreview> {
    return this.mealsService.previewKit(id, user.id);
  }
}
