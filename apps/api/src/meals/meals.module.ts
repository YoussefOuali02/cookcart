import { Module } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { AdminMealsController } from './admin-meals.controller';
import { IngredientsModule } from '../ingredients/ingredients.module';

@Module({
  imports: [IngredientsModule],
  controllers: [MealsController, AdminMealsController],
  providers: [MealsService],
  exports: [MealsService],
})
export class MealsModule {}
