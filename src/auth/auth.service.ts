import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon2 from 'argon2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    const hash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });

    return user;
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      return {
        statusCode: 403,
        message: 'Invalid credentials',
      };
    }

    const pwMatches = await argon2.verify(user.hash, dto.password);

    if (!pwMatches) {
      return {
        statusCode: 403,
        message: 'Invalid credentials',
      };
    }

    return user;
  }
}
