import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser() {
    return;
  }
}
