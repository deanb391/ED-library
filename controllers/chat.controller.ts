import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class ChatController {
  static async listUserChats(req: NextRequest) {
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

      const chats = await prisma.chat.findMany({
        where: {
          participants: {
            has: decoded.userId,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      const formatted = chats.map((c: any) => ({
        ...c,
        $id: c.id,
        $createdAt: c.createdAt.toISOString(),
        $updatedAt: c.updatedAt.toISOString(),
      }));

      return NextResponse.json({ chats: formatted, documents: formatted }, { status: 200 });
    } catch (error) {
      console.error('List chats error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async getMessages(req: NextRequest, targetChatId?: string) {
    try {
      const { searchParams } = req.nextUrl;
      const chatId = targetChatId || searchParams.get('chatId');

      if (!chatId) {
        return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
      }

      const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
      });

      const formatted = messages.map((m: any) => ({
        ...m,
        $id: m.id,
        $createdAt: m.createdAt.toISOString(),
        $updatedAt: m.updatedAt.toISOString(),
      }));

      return NextResponse.json({ messages: formatted, documents: formatted }, { status: 200 });
    } catch (error) {
      console.error('Get messages error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async sendMessage(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      let senderId = '';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const decoded = AuthService.verifyToken(authHeader.split(' ')[1]);
        if (decoded?.userId) senderId = decoded.userId;
      }

      const body = await req.json();
      const generatedId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const message = await prisma.message.create({
        data: {
          id: generatedId,
          chatId: body.chatId,
          senderId: senderId || body.senderId,
          text: body.text,
          status: 'sent',
        },
      });

      // Update chat's lastMessage
      if (body.chatId) {
        await prisma.chat.update({
          where: { id: body.chatId },
          data: {
            lastMessage: body.text,
            lastMessageSenderId: senderId || body.senderId,
            lastMessageAt: new Date(),
          },
        }).catch(() => {});
      }

      return NextResponse.json({
        ...message,
        $id: message.id,
        $createdAt: message.createdAt.toISOString(),
        $updatedAt: message.updatedAt.toISOString(),
      }, { status: 201 });
    } catch (error) {
      console.error('Send message error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
