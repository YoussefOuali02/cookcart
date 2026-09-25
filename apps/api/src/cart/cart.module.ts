import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MealsModule } from '../meals/meals.module';

@Module({
  imports: [MealsModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
