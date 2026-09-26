import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';
import { OrderWithItems } from './interfaces/order-with-items.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SafeUser } from '../users/user.serializer';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@CurrentUser() user: SafeUser): Promise<OrderWithItems[]> {
    return this.ordersService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
  ): Promise<OrderWithItems> {
    return this.ordersService.findOwnedOrder(user.id, id);
  }

  @Patch(':id/cancel')
  cancel(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
  ): Promise<OrderWithItems> {
    return this.ordersService.cancel(user.id, id);
  }
}
