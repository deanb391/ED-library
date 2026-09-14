import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class UserController {
  static async updateProfile(req: NextRequest) {
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
      const { username, name, department, level, university, avatar, bio } = body;

      const user = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          username: username !== undefined ? username : undefined,
          name: name !== undefined ? name : undefined,
          department: department !== undefined ? department : undefined,
          level: level !== undefined ? Number(level) : undefined,
          university: university !== undefined ? university : undefined,
          avatar: avatar !== undefined ? avatar : undefined,
        },
      });

      const { password, ...userWithoutPassword } = user;
      return NextResponse.json({ user: { ...userWithoutPassword, $id: user.id } }, { status: 200 });
    } catch (error) {
      console.error('Update profile error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async changePassword(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token);
      if (!decoded || !decoded.userId) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }

      const body = await req.json();
      const { oldPassword, newPassword } = body;

      if (!newPassword) {
        return NextResponse.json({ error: 'New password is required' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (user.password) {
        if (!oldPassword) {
          return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
        }
        const isValid = await AuthService.verifyPassword(oldPassword, user.password);
        if (!isValid) {
          return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }
      }

      const hashedPassword = await AuthService.hashPassword(newPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
    } catch (error) {
      console.error('Change password error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async getById(req: NextRequest, id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          department: true,
          level: true,
          university: true,
          isAdmin: true,
          isContributor: true,
          createdAt: true,
          contributor: {
            select: {
              id: true,
              username: true,
              profileImage: true,
              status: true,
              followers: true,
              total_earnings: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ user: { ...user, $id: user.id } }, { status: 200 });
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
