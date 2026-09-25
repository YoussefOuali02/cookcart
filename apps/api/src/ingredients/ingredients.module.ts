import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { AdminIngredientsController } from './admin-ingredients.controller';

@Module({
  controllers: [IngredientsController, AdminIngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
