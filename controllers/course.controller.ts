import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class CourseController {
  static async list(req: NextRequest) {
    try {
      const { searchParams } = req.nextUrl;
      const department = searchParams.get('department');
      const level = searchParams.get('level');
      const isOnGoing = searchParams.get('isOnGoing');
      const university = searchParams.get('university');
      const search = searchParams.get('search') || searchParams.get('query');
      const limit = parseInt(searchParams.get('limit') || '30', 10);
      const offset = parseInt(searchParams.get('offset') || '0', 10);

      const where: any = {};

      if (department) {
        where.department = { equals: department, mode: 'insensitive' };
      }
      if (level) {
        where.level = parseInt(level, 10);
      }
      if (isOnGoing !== null && isOnGoing !== undefined) {
        where.isOnGoing = isOnGoing === 'true';
      }
      if (university) {
        where.university = { contains: university, mode: 'insensitive' };
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { lecturer: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, courses] = await Promise.all([
        prisma.course.count({ where }),
        prisma.course.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                email: true,
              },
            },
          },
        }),
      ]);

      const formatted = courses.map(c => ({
        ...c,
        $id: c.id,
        $createdAt: c.createdAt.toISOString(),
        $updatedAt: c.updatedAt.toISOString(),
      }));

      return NextResponse.json({ total, courses: formatted, documents: formatted }, { status: 200 });
    } catch (error) {
      console.error('List courses error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async getById(req: NextRequest, id: string) {
    try {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              email: true,
            },
          },
          posts: {
            orderBy: { createdAt: 'desc' },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          documents: {
            where: { status: 'approved' },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      return NextResponse.json({
        ...course,
        $id: course.id,
        $createdAt: course.createdAt.toISOString(),
        $updatedAt: course.updatedAt.toISOString(),
      }, { status: 200 });
    } catch (error) {
      console.error('Get course by ID error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async getUserCourses(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token);
      if (!decoded || !decoded.userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const courses = await prisma.course.findMany({
        where: { userId: decoded.userId },
        orderBy: { updatedAt: 'desc' },
      });

      const formatted = courses.map(c => ({
        ...c,
        $id: c.id,
        $createdAt: c.createdAt.toISOString(),
        $updatedAt: c.updatedAt.toISOString(),
      }));

      return NextResponse.json({ courses: formatted }, { status: 200 });
    } catch (error) {
      console.error('Get user courses error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async create(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      let userId: string | null = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const decoded = AuthService.verifyToken(authHeader.split(' ')[1]);
        if (decoded?.userId) userId = decoded.userId;
      }

      const body = await req.json();
      const generatedId = `crs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const course = await prisma.course.create({
        data: {
          id: generatedId,
          title: body.title,
          code: body.code,
          description: body.description || null,
          lecturer: body.lecturer || null,
          thumbnailId: body.thumbnailId || null,
          thumbnailUrl: body.thumbnailUrl || null,
          files: Array.isArray(body.files) ? body.files : [],
          lastOperation: body.lastOperation || null,
          userId: userId || body.user || null,
          session: body.session || null,
          department: body.department || null,
          level: body.level ? parseInt(body.level, 10) : null,
          isOnGoing: body.isOnGoing !== false,
          price: body.price ? String(body.price) : null,
          university: body.university || null,
          analytics: typeof body.analytics === 'object' ? JSON.stringify(body.analytics) : body.analytics || null,
          pageCount: body.pageCount ? parseInt(body.pageCount, 10) : 0,
          isFree: body.isFree !== undefined ? !!body.isFree : null,
          rating: body.rating ? parseFloat(body.rating) : null,
          status: body.status || 'live',
        },
      });

      // Update contest points for author if applicable
      if (course.userId) {
        try {
          const contributor = await prisma.contributor.findUnique({
            where: { userId: course.userId },
          });

          if (contributor && contributor.joinedContest) {
            const perf = await prisma.contestPerformance.findFirst({
              where: { contributorId: contributor.id },
            });

            if (perf) {
              const startDate = new Date('2026-06-29T12:00:00Z');
              const now = new Date();
              if (now >= startDate) {
                const diffTime = Math.max(0, now.getTime() - startDate.getTime());
                const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                const dayKey = `day ${dayNumber}`;
                const points = perf.coursesPoints ? JSON.parse(perf.coursesPoints) : {};
                points[dayKey] = (points[dayKey] || 0) + 1;

                await prisma.contestPerformance.update({
                  where: { id: perf.id },
                  data: { coursesPoints: JSON.stringify(points) },
                });
              }
            }
          }
        } catch (contestErr) {
          console.error('Contest points update error:', contestErr);
        }
      }

      return NextResponse.json({
        ...course,
        $id: course.id,
        $createdAt: course.createdAt.toISOString(),
        $updatedAt: course.updatedAt.toISOString(),
      }, { status: 201 });
    } catch (error) {
      console.error('Create course error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async update(req: NextRequest, id: string) {
    try {
      const body = await req.json();
      const updated = await prisma.course.update({
        where: { id },
        data: {
          title: body.title !== undefined ? body.title : undefined,
          code: body.code !== undefined ? body.code : undefined,
          description: body.description !== undefined ? body.description : undefined,
          lecturer: body.lecturer !== undefined ? body.lecturer : undefined,
          thumbnailId: body.thumbnailId !== undefined ? body.thumbnailId : undefined,
          thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl : undefined,
          files: Array.isArray(body.files) ? body.files : undefined,
          session: body.session !== undefined ? body.session : undefined,
          department: body.department !== undefined ? body.department : undefined,
          level: body.level !== undefined ? parseInt(body.level, 10) : undefined,
          isOnGoing: body.isOnGoing !== undefined ? !!body.isOnGoing : undefined,
          price: body.price !== undefined ? String(body.price) : undefined,
          university: body.university !== undefined ? body.university : undefined,
          status: body.status !== undefined ? body.status : undefined,
          rating: body.rating !== undefined ? parseFloat(body.rating) : undefined,
          pageCount: body.pageCount !== undefined ? parseInt(body.pageCount, 10) : undefined,
        },
      });

      return NextResponse.json({
        ...updated,
        $id: updated.id,
        $createdAt: updated.createdAt.toISOString(),
        $updatedAt: updated.updatedAt.toISOString(),
      }, { status: 200 });
    } catch (error) {
      console.error('Update course error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async delete(req: NextRequest, id: string) {
    try {
      await prisma.course.delete({ where: { id } });
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Delete course error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
