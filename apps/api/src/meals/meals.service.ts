import { Injectable, NotFoundException } from '@nestjs/common';
import { Meal, MealIngredient, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IngredientsService } from '../ingredients/ingredients.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AddMealIngredientDto } from './dto/add-meal-ingredient.dto';

const mealWithIngredients = Prisma.validator<Prisma.MealDefaultArgs>()({
  include: { ingredients: { include: { ingredient: true } } },
});

export type MealWithIngredients = Prisma.MealGetPayload<
  typeof mealWithIngredients
>;

@Injectable()
export class MealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ingredientsService: IngredientsService,
  ) {}

  findAll(): Promise<Meal[]> {
    return this.prisma.meal.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<MealWithIngredients> {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
      ...mealWithIngredients,
    });

    if (!meal) {
      throw new NotFoundException(`Meal ${id} not found`);
    }

    return meal;
  }

  create(dto: CreateMealDto): Promise<Meal> {
    return this.prisma.meal.create({ data: dto });
  }

  async update(id: string, dto: UpdateMealDto): Promise<Meal> {
    await this.ensureExists(id);

    return this.prisma.meal.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.meal.delete({ where: { id } });
  }

  async addIngredient(
    mealId: string,
    dto: AddMealIngredientDto,
  ): Promise<MealIngredient> {
    await this.ensureExists(mealId);
    await this.ingredientsService.findById(dto.ingredientId);

    return this.prisma.mealIngredient.upsert({
      where: {
        mealId_ingredientId: {
          mealId,
          ingredientId: dto.ingredientId,
        },
      },
      update: {
        quantity: dto.quantity,
        unit: dto.unit,
        isOptional: dto.isOptional ?? false,
        cookingStep: dto.cookingStep,
      },
      create: {
        mealId,
        ingredientId: dto.ingredientId,
        quantity: dto.quantity,
        unit: dto.unit,
        isOptional: dto.isOptional ?? false,
        cookingStep: dto.cookingStep,
      },
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const meal = await this.prisma.meal.findUnique({ where: { id } });
    if (!meal) {
      throw new NotFoundException(`Meal ${id} not found`);
    }
  }
}
