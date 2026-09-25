import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash'>;

export function toSafeUser(user: User): SafeUser {
  const safeUser = { ...user } as Partial<User>;
  delete safeUser.passwordHash;
  return safeUser as SafeUser;
}
