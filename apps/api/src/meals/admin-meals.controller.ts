import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Meal, MealIngredient, UserRole } from '@prisma/client';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AddMealIngredientDto } from './dto/add-meal-ingredient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/meals')
export class AdminMealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  create(@Body() dto: CreateMealDto): Promise<Meal> {
    return this.mealsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMealDto): Promise<Meal> {
    return this.mealsService.update(id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.mealsService.remove(id);
  }

  @Post(':id/ingredients')
  addIngredient(
    @Param('id') id: string,
    @Body() dto: AddMealIngredientDto,
  ): Promise<MealIngredient> {
    return this.mealsService.addIngredient(id, dto);
  }
}
