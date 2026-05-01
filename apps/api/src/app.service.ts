import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'CookCart API is running';
  }

  async getHealth() {
    const userCount = await this.prisma.user.count();

    return {
      status: 'ok',
      database: 'connected',
      users: userCount,
      timestamp: new Date().toISOString(),
    };
  }
}
