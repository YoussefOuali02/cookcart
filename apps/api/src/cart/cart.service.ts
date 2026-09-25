import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import {
  OrderWithItems,
  orderWithItemsArgs,
} from '../orders/interfaces/order-with-items.interface';

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

  async checkout(userId: string): Promise<OrderWithItems> {
    const cart = await this.getOrCreateCart(userId);

    const orderItemsData = cart.meals.flatMap((cartMeal) =>
      cartMeal.ingredients
        .filter((cartIngredient) => !cartIngredient.isRemovedByUser)
        .map((cartIngredient) => ({
          mealId: cartMeal.mealId,
          ingredientId: cartIngredient.ingredientId,
          quantity: cartIngredient.quantity,
          unit: cartIngredient.unit,
          price: cartIngredient.price,
        })),
    );

    if (orderItemsData.length === 0) {
      throw new BadRequestException(
        'Cart has nothing to order — add a meal or keep at least one ingredient',
      );
    }

    const totalPrice =
      Math.round(
        orderItemsData.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0,
        ) * 100,
      ) / 100;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          totalPrice,
          items: { create: orderItemsData },
        },
        ...orderWithItemsArgs,
      });

      await tx.cartMeal.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return order;
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
