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
import { CartService } from './cart.service';
import { AddCartMealDto } from './dto/add-cart-meal.dto';
import { UpdateCartIngredientDto } from './dto/update-cart-ingredient.dto';
import { CartResponse } from './interfaces/cart-with-total.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SafeUser } from '../users/user.serializer';

@UseGuards(JwtAuthGuard)
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
}
