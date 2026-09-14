import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class CommunityController {
  static async getCommunity(req: NextRequest, targetContributorId?: string) {
    try {
      const { searchParams } = req.nextUrl;
      const contributorId = targetContributorId || searchParams.get('contributorId');

      if (!contributorId) {
        return NextResponse.json({ error: 'Contributor ID required' }, { status: 400 });
      }

      let community = await prisma.community.findUnique({
        where: { contributorId },
        include: {
          contributor: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
        },
      });

      if (!community) {
        community = await prisma.community.create({
          data: {
            id: `comm_${contributorId}`,
            contributorId,
          },
          include: {
            contributor: {
              select: {
                id: true,
                username: true,
                profileImage: true,
              },
            },
          },
        });
      }

      return NextResponse.json({
        community: {
          ...community,
          $id: community.id,
          $createdAt: community.createdAt.toISOString(),
          $updatedAt: community.updatedAt.toISOString(),
        },
      }, { status: 200 });
    } catch (error) {
      console.error('Get community error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async listThreads(req: NextRequest) {
    try {
      const { searchParams } = req.nextUrl;
      const communityId = searchParams.get('communityId');
      const parentId = searchParams.get('parentId');

      const where: any = {};
      if (communityId) where.communityId = communityId;
      if (parentId !== undefined && parentId !== null) {
        where.parentId = parentId === 'null' ? null : parentId;
      }

      const threads = await prisma.thread.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      const formatted = threads.map(t => ({
        ...t,
        $id: t.id,
        $createdAt: t.createdAt.toISOString(),
        $updatedAt: t.updatedAt.toISOString(),
      }));

      return NextResponse.json({ documents: formatted, threads: formatted }, { status: 200 });
    } catch (error) {
      console.error('List threads error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async createThread(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      let posterId = '';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const decoded = AuthService.verifyToken(authHeader.split(' ')[1]);
        if (decoded?.userId) posterId = decoded.userId;
      }

      const body = await req.json();
      const generatedId = `th_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const thread = await prisma.thread.create({
        data: {
          id: generatedId,
          communityId: body.communityId,
          posterId: posterId || body.posterId,
          isPosterAContributor: body.isPosterAContributor === true,
          content: body.content,
          mediaUrl: body.mediaUrl || null,
          mediaType: body.mediaType || null,
          parentId: body.parentId || null,
          likes: '[]',
          commentCount: 0,
          mediaData: typeof body.mediaData === 'object' ? JSON.stringify(body.mediaData) : body.mediaData || null,
        },
      });

      // Increment parent thread commentCount if reply
      if (body.parentId) {
        await prisma.thread.update({
          where: { id: body.parentId },
          data: { commentCount: { increment: 1 } },
        }).catch(() => {});
      }

      return NextResponse.json({
        ...thread,
        $id: thread.id,
        $createdAt: thread.createdAt.toISOString(),
        $updatedAt: thread.updatedAt.toISOString(),
      }, { status: 201 });
    } catch (error) {
      console.error('Create thread error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async likeThread(req: NextRequest, id: string) {
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

      const thread = await prisma.thread.findUnique({ where: { id } });
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      }

      let likes: string[] = [];
      try {
        likes = thread.likes ? JSON.parse(thread.likes) : [];
      } catch {
        likes = [];
      }

      const hasLiked = likes.includes(decoded.userId);
      let updatedLikes: string[];

      if (hasLiked) {
        updatedLikes = likes.filter(uId => uId !== decoded.userId);
      } else {
        updatedLikes = [...likes, decoded.userId];
      }

      const updated = await prisma.thread.update({
        where: { id },
        data: { likes: JSON.stringify(updatedLikes) },
      });

      return NextResponse.json({
        liked: !hasLiked,
        likeCount: updatedLikes.length,
        likes: updatedLikes,
      }, { status: 200 });
    } catch (error) {
      console.error('Like thread error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
