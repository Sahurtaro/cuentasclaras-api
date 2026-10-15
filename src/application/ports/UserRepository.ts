import type { User } from '../../domain/entities/user.js';

export interface UserRecord extends User {
  passwordHash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  create(user: User, passwordHash: string): Promise<void>;
}
