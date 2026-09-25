import { Injectable, NotFoundException } from '@nestjs/common';
import { PantryItem, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IngredientsService } from '../ingredients/ingredients.service';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';

const pantryItemWithIngredient =
  Prisma.validator<Prisma.PantryItemDefaultArgs>()({
    include: { ingredient: true },
  });

export type PantryItemWithIngredient = Prisma.PantryItemGetPayload<
  typeof pantryItemWithIngredient
>;

@Injectable()
export class PantryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ingredientsService: IngredientsService,
  ) {}

  findAll(userId: string): Promise<PantryItemWithIngredient[]> {
    return this.prisma.pantryItem.findMany({
      where: { userId },
      ...pantryItemWithIngredient,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(
    userId: string,
    dto: CreatePantryItemDto,
  ): Promise<PantryItemWithIngredient> {
    await this.ingredientsService.findById(dto.ingredientId);

    return this.prisma.pantryItem.upsert({
      where: {
        userId_ingredientId: {
          userId,
          ingredientId: dto.ingredientId,
        },
      },
      update: {
        quantity: dto.quantity,
        unit: dto.unit,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        alwaysAvailable: dto.alwaysAvailable ?? false,
      },
      create: {
        userId,
        ingredientId: dto.ingredientId,
        quantity: dto.quantity,
        unit: dto.unit,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        alwaysAvailable: dto.alwaysAvailable ?? false,
      },
      ...pantryItemWithIngredient,
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdatePantryItemDto,
  ): Promise<PantryItemWithIngredient> {
    await this.findOwned(userId, id);

    return this.prisma.pantryItem.update({
      where: { id },
      data: {
        quantity: dto.quantity,
        unit: dto.unit,
        expiryDate:
          dto.expiryDate === undefined
            ? undefined
            : dto.expiryDate
              ? new Date(dto.expiryDate)
              : null,
        alwaysAvailable: dto.alwaysAvailable,
      },
      ...pantryItemWithIngredient,
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwned(userId, id);
    await this.prisma.pantryItem.delete({ where: { id } });
  }

  private async findOwned(userId: string, id: string): Promise<PantryItem> {
    const item = await this.prisma.pantryItem.findUnique({ where: { id } });

    if (!item || item.userId !== userId) {
      throw new NotFoundException(`Pantry item ${id} not found`);
    }

    return item;
  }
}
