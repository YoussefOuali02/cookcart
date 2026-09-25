import { Prisma } from '@prisma/client';

const cartWithDetails = Prisma.validator<Prisma.CartDefaultArgs>()({
  include: {
    meals: {
      include: {
        meal: true,
        ingredients: { include: { ingredient: true } },
      },
    },
  },
});

export type CartWithDetails = Prisma.CartGetPayload<typeof cartWithDetails>;

export const cartWithDetailsArgs = cartWithDetails;

export interface CartResponse extends CartWithDetails {
  totalPrice: number;
}
