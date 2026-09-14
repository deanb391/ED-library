import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class LibraryController {
  static async getLibrary(req: NextRequest, targetUserId?: string) {
    try {
      const { searchParams } = req.nextUrl;
      let userId = targetUserId || searchParams.get('userId');

      if (!userId) {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const decoded = AuthService.verifyToken(authHeader.split(' ')[1]);
          if (decoded?.userId) userId = decoded.userId;
        }
      }

      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }

      let library = await prisma.library.findUnique({
        where: { userId },
      });

      if (!library) {
        library = await prisma.library.create({
          data: {
            id: `lib_${userId}`,
            userId,
            oneTime: '[]',
            subscription: '[]',
          },
        });
      }

      let oneTimeCourses: string[] = [];
      let subscriptionCourses: string[] = [];

      try {
        oneTimeCourses = library.oneTime ? JSON.parse(library.oneTime) : [];
      } catch {
        oneTimeCourses = library.oneTime ? [library.oneTime] : [];
      }

      try {
        subscriptionCourses = library.subscription ? JSON.parse(library.subscription) : [];
      } catch {
        subscriptionCourses = library.subscription ? [library.subscription] : [];
      }

      return NextResponse.json({
        library: {
          ...library,
          $id: library.id,
          oneTimeList: oneTimeCourses,
          subscriptionList: subscriptionCourses,
          $createdAt: library.createdAt.toISOString(),
          $updatedAt: library.updatedAt.toISOString(),
        },
      }, { status: 200 });
    } catch (error) {
      console.error('Get library error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async addCourse(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      let userId: string | null = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const decoded = AuthService.verifyToken(authHeader.split(' ')[1]);
        if (decoded?.userId) userId = decoded.userId;
      }

      const body = await req.json();
      const targetUserId = userId || body.userId || body.user;
      const courseId = body.courseId || body.course;
      const type = body.type || 'oneTime'; // 'oneTime' or 'subscription'

      if (!targetUserId || !courseId) {
        return NextResponse.json({ error: 'User ID and Course ID required' }, { status: 400 });
      }

      let library = await prisma.library.findUnique({ where: { userId: targetUserId } });
      if (!library) {
        library = await prisma.library.create({
          data: {
            id: `lib_${targetUserId}`,
            userId: targetUserId,
            oneTime: '[]',
            subscription: '[]',
          },
        });
      }

      let list: string[] = [];
      const field = type === 'subscription' ? 'subscription' : 'oneTime';
      try {
        list = library[field] ? JSON.parse(library[field]!) : [];
      } catch {
        list = library[field] ? [library[field]!] : [];
      }

      if (!list.includes(courseId)) {
        list.push(courseId);
      }

      const updated = await prisma.library.update({
        where: { userId: targetUserId },
        data: {
          [field]: JSON.stringify(list),
        },
      });

      return NextResponse.json({
        library: {
          ...updated,
          $id: updated.id,
          $createdAt: updated.createdAt.toISOString(),
          $updatedAt: updated.updatedAt.toISOString(),
        },
      }, { status: 200 });
    } catch (error) {
      console.error('Add to library error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
