import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
  };
}

@Injectable()
export class AuthService {
  private readonly testUser: User = {
    id: '1',
    username: 'demo',
    password: '$2a$10$gR3ovFGGSh/qLSxVUBAdr./2uovjqEvHr0rZ0b6qvk8ySZmRM.UR2', // 'demo' hashed pwd
  };

  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<User | undefined> {
    if (username === this.testUser.username) {
      const isPasswordValid = await bcrypt.compare(password, this.testUser.password);
      if (isPasswordValid) {
        return this.testUser;
      }
    }
    return undefined;
  }

  async login(user: User): Promise<AuthResponse> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }
} 