import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

    // Remove hash before sending response
    const { hash: _, ...safeUser } = user;

    return safeUser;
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

    // Remove hash before sending response
    const { hash: _, ...safeUser } = user;

    return safeUser;
  }
}
