import { Prisma } from '@prisma/client';

const orderWithItems = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    items: { include: { ingredient: true, meal: true } },
  },
});

export type OrderWithItems = Prisma.OrderGetPayload<typeof orderWithItems>;

export const orderWithItemsArgs = orderWithItems;

const orderWithItemsAndUser = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    items: { include: { ingredient: true, meal: true } },
    user: {
      select: { id: true, email: true, firstName: true, lastName: true },
    },
  },
});

export type OrderWithItemsAndUser = Prisma.OrderGetPayload<
  typeof orderWithItemsAndUser
>;

export const orderWithItemsAndUserArgs = orderWithItemsAndUser;
