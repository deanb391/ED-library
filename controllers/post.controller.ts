import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';

export class PostController {
  static async listByCourse(req: NextRequest, courseId?: string) {
    try {
      const { searchParams } = req.nextUrl;
      const targetCourseId = courseId || searchParams.get('courseId') || searchParams.get('course');
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const offset = parseInt(searchParams.get('offset') || '0', 10);

      const where: any = {};
      if (targetCourseId) {
        where.courseId = targetCourseId;
      }

      const posts = await prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
      });

      const formatted = posts.map(p => ({
        ...p,
        $id: p.id,
        $createdAt: p.createdAt.toISOString(),
        $updatedAt: p.updatedAt.toISOString(),
      }));

      return NextResponse.json({ total: formatted.length, documents: formatted, posts: formatted }, { status: 200 });
    } catch (error) {
      console.error('List posts error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async fetchAll(req: NextRequest) {
    try {
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
      });

      const formatted = posts.map(p => ({
        ...p,
        $id: p.id,
        $createdAt: p.createdAt.toISOString(),
        $updatedAt: p.updatedAt.toISOString(),
      }));

      return NextResponse.json({ total: formatted.length, documents: formatted, posts: formatted }, { status: 200 });
    } catch (error) {
      console.error('Fetch all posts error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async create(req: NextRequest) {
    try {
      const body = await req.json();
      const generatedId = `pst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const post = await prisma.post.create({
        data: {
          id: generatedId,
          description: body.description || null,
          images: Array.isArray(body.images) ? body.images : [],
          courseId: body.courses || body.courseId || null,
        },
      });

      return NextResponse.json({
        ...post,
        $id: post.id,
        $createdAt: post.createdAt.toISOString(),
        $updatedAt: post.updatedAt.toISOString(),
      }, { status: 201 });
    } catch (error) {
      console.error('Create post error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
