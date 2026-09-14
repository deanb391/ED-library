import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class ContributorController {
  static async me(req: NextRequest) {
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

      const contributor = await prisma.contributor.findUnique({
        where: { userId: decoded.userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      if (!contributor) {
        return NextResponse.json({ contributor: null }, { status: 200 });
      }

      return NextResponse.json({
        contributor: {
          ...contributor,
          $id: contributor.id,
          $createdAt: contributor.createdAt.toISOString(),
          $updatedAt: contributor.updatedAt.toISOString(),
        },
      }, { status: 200 });
    } catch (error) {
      console.error('Get my contributor error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async getByIdOrUser(req: NextRequest, identifier: string) {
    try {
      let contributor = await prisma.contributor.findUnique({
        where: { id: identifier },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      if (!contributor) {
        contributor = await prisma.contributor.findUnique({
          where: { userId: identifier },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        });
      }

      if (!contributor) {
        return NextResponse.json({ error: 'Contributor not found' }, { status: 404 });
      }

      return NextResponse.json({
        ...contributor,
        $id: contributor.id,
        $createdAt: contributor.createdAt.toISOString(),
        $updatedAt: contributor.updatedAt.toISOString(),
      }, { status: 200 });
    } catch (error) {
      console.error('Get contributor error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async listTop(req: NextRequest) {
    try {
      const topContributors = await prisma.contributor.findMany({
        orderBy: [{ total_earnings: 'desc' }, { followers: 'desc' }],
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      const formatted = topContributors.map(c => ({
        ...c,
        $id: c.id,
        $createdAt: c.createdAt.toISOString(),
        $updatedAt: c.updatedAt.toISOString(),
      }));

      return NextResponse.json({ contributors: formatted }, { status: 200 });
    } catch (error) {
      console.error('List top contributors error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async update(req: NextRequest, id: string) {
    try {
      const body = await req.json();

      const updated = await prisma.contributor.update({
        where: { id },
        data: {
          username: body.username !== undefined ? body.username : undefined,
          institution: body.institution !== undefined ? body.institution : undefined,
          country: body.country !== undefined ? body.country : undefined,
          bio: body.bio !== undefined ? body.bio : undefined,
          category: Array.isArray(body.category) ? body.category : undefined,
          profileImage: body.profileImage !== undefined ? body.profileImage : undefined,
          status: body.status !== undefined ? body.status : undefined,
          hasSeenCelebration: body.hasSeenCelebration !== undefined ? !!body.hasSeenCelebration : undefined,
          agreed: body.agreed !== undefined ? !!body.agreed : undefined,
          phone: body.phone !== undefined ? body.phone : undefined,
          joinedContest: body.joinedContest !== undefined ? !!body.joinedContest : undefined,
          joinedContestAt: body.joinedContestAt !== undefined ? body.joinedContestAt : undefined,
        },
      });

      return NextResponse.json({
        ...updated,
        $id: updated.id,
        $createdAt: updated.createdAt.toISOString(),
        $updatedAt: updated.updatedAt.toISOString(),
      }, { status: 200 });
    } catch (error) {
      console.error('Update contributor error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async follow(req: NextRequest) {
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

      const body = await req.json();
      const { contributorId } = body;

      if (!contributorId) {
        return NextResponse.json({ error: 'Contributor ID required' }, { status: 400 });
      }

      const contributor = await prisma.contributor.findUnique({ where: { id: contributorId } });
      if (!contributor) {
        return NextResponse.json({ error: 'Contributor not found' }, { status: 404 });
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      const followingList = user?.followingContributors ? JSON.parse(user.followingContributors) : [];

      const isFollowing = followingList.includes(contributorId);
      let updatedFollowing: string[];
      let newFollowersCount = contributor.followers;

      if (isFollowing) {
        updatedFollowing = followingList.filter((id: string) => id !== contributorId);
        newFollowersCount = Math.max(0, newFollowersCount - 1);
      } else {
        updatedFollowing = [...followingList, contributorId];
        newFollowersCount += 1;
      }

      await Promise.all([
        prisma.user.update({
          where: { id: decoded.userId },
          data: { followingContributors: JSON.stringify(updatedFollowing) },
        }),
        prisma.contributor.update({
          where: { id: contributorId },
          data: { followers: newFollowersCount },
        }),
      ]);

      return NextResponse.json({ isFollowing: !isFollowing, followers: newFollowersCount }, { status: 200 });
    } catch (error) {
      console.error('Follow contributor error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
