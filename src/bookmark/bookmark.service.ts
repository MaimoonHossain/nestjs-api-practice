import { Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  createBookmark(userId: number, dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
    return this.prisma.bookmark.updateMany({
      where: {
        id: bookmarkId,
        userId,
      },
      data: {
        ...dto,
      },
    });
  }

  deleteBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.deleteMany({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }
}
