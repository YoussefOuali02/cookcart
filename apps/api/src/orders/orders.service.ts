import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  OrderWithItems,
  OrderWithItemsAndUser,
  orderWithItemsArgs,
  orderWithItemsAndUserArgs,
} from './interfaces/order-with-items.interface';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string): Promise<OrderWithItems[]> {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      ...orderWithItemsArgs,
    });
  }

  async findOwnedOrder(userId: string, id: string): Promise<OrderWithItems> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      ...orderWithItemsArgs,
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async cancel(userId: string, id: string): Promise<OrderWithItems> {
    const order = await this.findOwnedOrder(userId, id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      ...orderWithItemsArgs,
    });
  }

  findAllForAdmin(): Promise<OrderWithItemsAndUser[]> {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      ...orderWithItemsAndUserArgs,
    });
  }

  async findByIdForAdmin(id: string): Promise<OrderWithItemsAndUser> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      ...orderWithItemsAndUserArgs,
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderWithItemsAndUser> {
    await this.findByIdForAdmin(id);

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      ...orderWithItemsAndUserArgs,
    });
  }
}
