import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const checkIfExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (checkIfExists) {
      throw new ForbiddenException('User already exists');
    }
    // Hash password
    const hash = await argon2.hash(dto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });

    return this.signToken(user.id, user.email);
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const pwMatches = await argon2.verify(user.hash, dto.password);

    if (!pwMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get<string>('JWT_SECRET');

    return {
      access_token: await this.jwt.signAsync(payload, {
        expiresIn: '15m',
        secret,
      }),
    };
  }
}
