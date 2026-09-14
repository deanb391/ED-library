import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class DocumentController {
  static async listByCourse(req: NextRequest, targetCourseId?: string) {
    try {
      const { searchParams } = req.nextUrl;
      const courseId = targetCourseId || searchParams.get('courseId');

      const where: any = { status: 'approved' };
      if (courseId) where.courseId = courseId;

      const documents = await prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      const formatted = documents.map(d => ({
        ...d,
        $id: d.id,
        $createdAt: d.createdAt.toISOString(),
        $updatedAt: d.updatedAt.toISOString(),
      }));

      return NextResponse.json({ documents: formatted, total: formatted.length }, { status: 200 });
    } catch (error) {
      console.error('List documents error:', error);
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
      const generatedId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const document = await prisma.document.create({
        data: {
          id: generatedId,
          courseId: body.courses || body.courseId || null,
          userId: userId || body.user || body.userId || null,
          fileUrl: body.fileUrl || null,
          fileName: body.fileName || null,
          fileSize: body.fileSize ? parseFloat(body.fileSize) : null,
          fileType: body.fileType || null,
          description: body.description || null,
          status: body.status || 'pending',
          reviewReason: body.reviewReason || null,
        },
      });

      return NextResponse.json({
        ...document,
        $id: document.id,
        $createdAt: document.createdAt.toISOString(),
        $updatedAt: document.updatedAt.toISOString(),
      }, { status: 201 });
    } catch (error) {
      console.error('Create document error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async review(req: NextRequest) {
    try {
      const body = await req.json();
      const { documentId, status, reviewReason } = body;

      if (!documentId || !status) {
        return NextResponse.json({ error: 'Document ID and status required' }, { status: 400 });
      }

      const updated = await prisma.document.update({
        where: { id: documentId },
        data: {
          status,
          reviewReason: reviewReason || undefined,
        },
      });

      return NextResponse.json({
        ...updated,
        $id: updated.id,
        $createdAt: updated.createdAt.toISOString(),
        $updatedAt: updated.updatedAt.toISOString(),
      }, { status: 200 });
    } catch (error) {
      console.error('Review document error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
