import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CartService } from './cart.service';
import { AddCartMealDto } from './dto/add-cart-meal.dto';
import { UpdateCartIngredientDto } from './dto/update-cart-ingredient.dto';
import { CartResponse } from './interfaces/cart-with-total.interface';
import { OrderWithItems } from '../orders/interfaces/order-with-items.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SafeUser } from '../users/user.serializer';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: SafeUser): Promise<CartResponse> {
    return this.cartService.getCart(user.id);
  }

  @Post('meals')
  addMeal(
    @CurrentUser() user: SafeUser,
    @Body() dto: AddCartMealDto,
  ): Promise<CartResponse> {
    return this.cartService.addMeal(user.id, dto);
  }

  @Patch('ingredients/:id')
  updateIngredient(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
    @Body() dto: UpdateCartIngredientDto,
  ): Promise<CartResponse> {
    return this.cartService.updateIngredient(user.id, id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('meals/:id')
  removeMeal(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.cartService.removeMeal(user.id, id);
  }

  @Post('checkout')
  checkout(@CurrentUser() user: SafeUser): Promise<OrderWithItems> {
    return this.cartService.checkout(user.id);
  }
}
