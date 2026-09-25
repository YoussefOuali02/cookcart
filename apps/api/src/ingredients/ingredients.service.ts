import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Ingredient, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Ingredient[]> {
    return this.prisma.ingredient.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<Ingredient> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient ${id} not found`);
    }

    return ingredient;
  }

  async create(dto: CreateIngredientDto): Promise<Ingredient> {
    try {
      return await this.prisma.ingredient.create({ data: dto });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async update(id: string, dto: UpdateIngredientDto): Promise<Ingredient> {
    await this.findById(id);

    try {
      return await this.prisma.ingredient.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.ingredient.delete({ where: { id } });
  }

  private mapError(error: unknown): Error {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException(
        'An ingredient with this name already exists',
      );
    }

    return error as Error;
  }
}
