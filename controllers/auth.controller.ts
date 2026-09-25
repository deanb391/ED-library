import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: NextRequest) {
    try {
      const body = await req.json();
      const { email, password, username, level, department, university, referredBy } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }

      const hashedPassword = await AuthService.hashPassword(password);
      const generatedId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const user = await prisma.user.create({
        data: {
          id: generatedId,
          email: normalizedEmail,
          password: hashedPassword,
          username: username || normalizedEmail.split('@')[0],
          name: username || '',
          level: level ? Number(level) : null,
          department: department || null,
          university: university || null,
          referredBy: referredBy || null,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username || normalizedEmail)}&background=random&color=fff`,
        },
      });

      // Create initial wallet for new user
      try {
        await prisma.wallet.create({
          data: {
            id: `wlt_${user.id}`,
            userId: user.id,
            balance: 0,
          },
        });
      } catch (walletErr) {
        console.error('Wallet initialization error:', walletErr);
      }

      const token = AuthService.generateToken(user.id, user.email);

      return NextResponse.json({
        user: {
          id: user.id,
          $id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          level: user.level,
          department: user.department,
          university: user.university,
          isAdmin: user.isAdmin,
          isContributor: user.isContributor,
          isPremium: user.isPremium,
          premiumExpiresAt: user.premiumExpiresAt,
          createdAt: user.createdAt,
          hasPassword: !!user.password,
        },
        token,
      }, { status: 201 });
    } catch (error) {
      console.error('Registration error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async login(req: NextRequest) {
    try {
      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const trimmedEmail = email.trim().toLowerCase();
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: trimmedEmail,
            mode: 'insensitive',
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      if (!user.password) {
        return NextResponse.json({ error: 'Please sign in with Google or reset your password' }, { status: 401 });
      }

      const isValidPassword = await AuthService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // If user had an old Argon2 hash, optionally upgrade to bcrypt in the background
      if (user.password.startsWith('$argon2')) {
        AuthService.hashPassword(password)
          .then(newHash => prisma.user.update({ where: { id: user.id }, data: { password: newHash } }))
          .catch(() => {});
      }

      // Update last active time
      prisma.user.update({
        where: { id: user.id },
        data: { lastTime: new Date() },
      }).catch(() => {});

      const token = AuthService.generateToken(user.id, user.email);

      return NextResponse.json({
        user: {
          id: user.id,
          $id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          level: user.level,
          department: user.department,
          university: user.university,
          isAdmin: user.isAdmin,
          isContributor: user.isContributor,
          isPremium: user.isPremium,
          premiumExpiresAt: user.premiumExpiresAt,
          createdAt: user.createdAt,
          hasPassword: !!user.password,
        },
        token,
      }, { status: 200 });
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async me(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token);

      if (!decoded || !decoded.userId) {
        return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          department: true,
          level: true,
          university: true,
          referredBy: true,
          isAdmin: true,
          isContributor: true,
          isPremium: true,
          premiumExpiresAt: true,
          followingContributors: true,
          lastTime: true,
          createdAt: true,
          updatedAt: true,
          password: true,
          contributor: {
            select: {
              id: true,
              username: true,
              status: true,
              followers: true,
              total_earnings: true,
              isTopContributor: true,
            },
          },
          wallet: {
            select: {
              id: true,
              balance: true,
            },
          },
          library: {
            select: {
              id: true,
              oneTime: true,
              subscription: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const { password, ...userWithoutPassword } = user;

      return NextResponse.json({
        user: {
          ...userWithoutPassword,
          $id: user.id,
          hasPassword: !!password,
        },
      }, { status: 200 });
    } catch (error) {
      console.error('Me error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async updateUserActivity(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token);
      if (!decoded || !decoded.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json().catch(() => ({}));
      const lastTime = body.lastTime ? new Date(body.lastTime) : new Date();

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { lastTime },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Update activity error:', error);
      return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
    }
  }
}
