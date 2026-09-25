import { Injectable, NotFoundException } from '@nestjs/common';
import { CartIngredient, CartMeal } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MealsService } from '../meals/meals.service';
import { AddCartMealDto } from './dto/add-cart-meal.dto';
import { UpdateCartIngredientDto } from './dto/update-cart-ingredient.dto';
import {
  CartResponse,
  CartWithDetails,
  cartWithDetailsArgs,
} from './interfaces/cart-with-total.interface';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mealsService: MealsService,
  ) {}

  async getCart(userId: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId);
    return this.toCartResponse(cart);
  }

  async addMeal(userId: string, dto: AddCartMealDto): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId);
    const meal = await this.mealsService.findById(dto.mealId);
    const servings = dto.servings ?? 1;

    const pantryItems = await this.prisma.pantryItem.findMany({
      where: { userId },
    });
    const pantryByIngredientId = new Map(
      pantryItems.map((item) => [item.ingredientId, item]),
    );

    await this.prisma.$transaction(async (tx) => {
      const cartMeal = await tx.cartMeal.create({
        data: { cartId: cart.id, mealId: meal.id, servings },
      });

      await tx.cartIngredient.createMany({
        data: meal.ingredients.map((mealIngredient) => {
          const requiredQuantity = mealIngredient.quantity * servings;
          const pantryItem = pantryByIngredientId.get(
            mealIngredient.ingredientId,
          );
          const userHasIt = Boolean(
            pantryItem &&
            (pantryItem.alwaysAvailable ||
              pantryItem.quantity >= requiredQuantity),
          );

          return {
            cartMealId: cartMeal.id,
            ingredientId: mealIngredient.ingredientId,
            quantity: requiredQuantity,
            unit: mealIngredient.unit,
            price: mealIngredient.ingredient.pricePerUnit,
            isRemovedByUser: userHasIt,
          };
        }),
      });
    });

    return this.getCart(userId);
  }

  async updateIngredient(
    userId: string,
    cartIngredientId: string,
    dto: UpdateCartIngredientDto,
  ): Promise<CartResponse> {
    await this.findOwnedIngredient(userId, cartIngredientId);

    await this.prisma.cartIngredient.update({
      where: { id: cartIngredientId },
      data: {
        isRemovedByUser: dto.isRemovedByUser,
        removalReason: dto.removalReason,
      },
    });

    return this.getCart(userId);
  }

  async removeMeal(userId: string, cartMealId: string): Promise<void> {
    await this.findOwnedMeal(userId, cartMealId);
    await this.prisma.cartMeal.delete({ where: { id: cartMealId } });
  }

  private async getOrCreateCart(userId: string): Promise<CartWithDetails> {
    const existing = await this.prisma.cart.findUnique({
      where: { userId },
      ...cartWithDetailsArgs,
    });

    if (existing) {
      return existing;
    }

    return this.prisma.cart.create({
      data: { userId },
      ...cartWithDetailsArgs,
    });
  }

  private async findOwnedMeal(
    userId: string,
    cartMealId: string,
  ): Promise<CartMeal> {
    const cartMeal = await this.prisma.cartMeal.findUnique({
      where: { id: cartMealId },
      include: { cart: true },
    });

    if (!cartMeal || cartMeal.cart.userId !== userId) {
      throw new NotFoundException(`Cart meal ${cartMealId} not found`);
    }

    return cartMeal;
  }

  private async findOwnedIngredient(
    userId: string,
    cartIngredientId: string,
  ): Promise<CartIngredient> {
    const cartIngredient = await this.prisma.cartIngredient.findUnique({
      where: { id: cartIngredientId },
      include: { cartMeal: { include: { cart: true } } },
    });

    if (!cartIngredient || cartIngredient.cartMeal.cart.userId !== userId) {
      throw new NotFoundException(
        `Cart ingredient ${cartIngredientId} not found`,
      );
    }

    return cartIngredient;
  }

  private toCartResponse(cart: CartWithDetails): CartResponse {
    let totalPrice = 0;

    for (const cartMeal of cart.meals) {
      for (const cartIngredient of cartMeal.ingredients) {
        if (!cartIngredient.isRemovedByUser) {
          totalPrice += cartIngredient.quantity * cartIngredient.price;
        }
      }
    }

    return { ...cart, totalPrice: Math.round(totalPrice * 100) / 100 };
  }
}
