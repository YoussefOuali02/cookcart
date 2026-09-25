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
import { PantryService, PantryItemWithIngredient } from './pantry.service';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SafeUser } from '../users/user.serializer';

@UseGuards(JwtAuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(private readonly pantryService: PantryService) {}

  @Get()
  findAll(@CurrentUser() user: SafeUser): Promise<PantryItemWithIngredient[]> {
    return this.pantryService.findAll(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: SafeUser,
    @Body() dto: CreatePantryItemDto,
  ): Promise<PantryItemWithIngredient> {
    return this.pantryService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
    @Body() dto: UpdatePantryItemDto,
  ): Promise<PantryItemWithIngredient> {
    return this.pantryService.update(user.id, id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.pantryService.remove(user.id, id);
  }
}
